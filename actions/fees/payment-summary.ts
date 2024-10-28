// actions/fee/payment-summary.ts
'use server'

import prisma from "@/lib/prisma";
import { SelectedParams } from "@/app/(dashboard)/fees/payment-summary/PaymentSummaryClient";

export async function getPaymentSummary(params: SelectedParams) {
  const {
    academicYearId,
    termId,
    gradeId,
    classId,
    feeStructureIds,
    dateRange,
    paymentStatus,
    paymentType
  } = params;

  // 1. First get all fee structures to properly filter them later
  const feeStructures = await prisma.feeStructure.findMany({
    where: {
      academicYearId,
      termId,
      isActive: true,
      ...(feeStructureIds.length > 0 && {
        id: { in: feeStructureIds }
      })
    },
    include: {
      feeType: true,
      grades: true,
      classes: true,
      specialProgrammes: true,
    }
  });

  // 2. Build student query
  const studentWhere: any = {
    status: 'ACTIVE'
  };
  if (gradeId) studentWhere.gradeId = gradeId;
  if (classId) studentWhere.classId = classId;

  // 3. Get students with all necessary relations
  const students = await prisma.student.findMany({
    where: studentWhere,
    include: {
      grade: true,
      class: true,
      specialProgrammes: true,
      feeStatus: {
        where: {
          academicYearId,
          termId,
          ...(paymentStatus !== 'ALL' && { status: paymentStatus }),
          ...(feeStructureIds.length > 0 && {
            feeStructureId: { in: feeStructureIds }
          })
        },
        include: {
          feeStructure: {
            include: { 
              feeType: true,
              specialProgrammes: true
            }
          },
          payments: {
            where: {
              academicYearId,
              termId,
              ...(paymentType !== 'ALL' && { paymentType }),
              ...(dateRange?.from && {
                paymentDate: {
                  gte: dateRange.from,
                  ...(dateRange?.to && { lte: dateRange.to })
                }
              })
            },
            include: {
              generatedExcessFee: true // Include the excess fee information
            },
            orderBy: { paymentDate: 'desc' }
          }
        }
      },
      // Include excess fees for the student
      excessFees: {
        where: {
          academicYearId,
          termId,
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  // 4. Process each student's data
  return students.map(student => {
    // Filter fee structures applicable to this student
    const applicableFeeStructures = feeStructures.filter(fs => {
      // Check if this is a special programme fee
      const isSpecialProgrammeFee = fs.specialProgrammes.length > 0;

      if (isSpecialProgrammeFee) {
        // For special programme fees, student must be enrolled in the programme
        return fs.specialProgrammes.some(specialProgramme =>
          student.specialProgrammes.some(studentProgramme => 
            studentProgramme.id === specialProgramme.id
          )
        );
      }

      // For regular fees, check grade and class matching
      const matchingGrade = fs.grades.some(g => g.id === student.gradeId);
      const matchingClass = fs.classes.some(c => c.id === student.classId) || fs.classes.length === 0;
      
      return matchingGrade || matchingClass;
    });

    // Calculate fee totals based on applicable fee structures
    const totalExpected = applicableFeeStructures.reduce((sum, fs) => sum + fs.amount, 0);

    // Get existing fee status records
    const existingFeeStatus = student.feeStatus.filter(fs => 
      applicableFeeStructures.some(afs => afs.id === fs.feeStructureId)
    );

    const totalPaid = existingFeeStatus.reduce((sum, fs) => sum + fs.paidAmount, 0);
    const balance = totalExpected - totalPaid;

    // Get last payment date
    const allPayments = existingFeeStatus.flatMap(fs => fs.payments);
    const lastPaymentDate = allPayments.length > 0 
      ? allPayments.sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime())[0].paymentDate
      : null;

    // Calculate total excess fees
    const totalExcessFees = student.excessFees.reduce((sum:any, excess:any) => sum + excess.amount, 0);
    
    // Get unused excess fees (where isUsed is false)
    const unusedExcessFees = student.excessFees.filter(excess => !excess.isUsed);
    const totalUnusedExcessFees = unusedExcessFees.reduce((sum, excess) => sum + excess.amount, 0);

    // Build fee structures details
    const feeStructuresDetails = applicableFeeStructures.map(fs => {
      const status = existingFeeStatus.find(efs => efs.feeStructureId === fs.id);
      
      return {
        id: fs.id,
        name: fs.feeType.name,
        amount: fs.amount,
        paid: status?.paidAmount || 0,
        balance: fs.amount - (status?.paidAmount || 0),
        dueDate: fs.dueDate,
        status: status?.status || 'PENDING',
        payments: status?.payments.map(p => ({
          id: p.id,
          amount: p.amount,
          paymentDate: p.paymentDate,
          paymentType: p.paymentType,
          status: p.status,
          reference: p.reference,
          hasExcessFee: p.hasExcessFee,
          excessAmount: p.excessAmount,
          generatedExcessFee: p.generatedExcessFee ? {
            id: p.generatedExcessFee.id,
            amount: p.generatedExcessFee.amount,
            isUsed: p.generatedExcessFee.isUsed,
            createdAt: p.generatedExcessFee.createdAt
          } : null
        })) || []
      };
    });

    return {
      studentId: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      admissionNumber: student.admissionNumber,
      totalExpected,
      totalPaid,
      balance,
      lastPaymentDate,
      feeStructures: feeStructuresDetails,
      excessFees: {
        total: totalExcessFees,
        unusedTotal: totalUnusedExcessFees,
        details: student.excessFees.map(excess => ({
          id: excess.id,
          amount: excess.amount,
          isUsed: excess.isUsed,
          createdAt: excess.createdAt,
          description: excess.description
        }))
      }
    };
  });
}