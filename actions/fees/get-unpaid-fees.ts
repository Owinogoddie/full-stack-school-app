'use server'

import prisma from '@/lib/prisma';
import type { UnpaidFeesResponse } from './types'
import type { Prisma } from '@prisma/client';

export async function getUnpaidFeesByGradeOrClass(
  params: {
    academicYearId: number;
    termId: string;
    classIds?: number[];
    feeStructureIds?: string[];
  }
): Promise<UnpaidFeesResponse> {
  const { academicYearId, termId, classIds, feeStructureIds } = params;

  if (!classIds?.length) {
    throw new Error('classIds must be provided');
  }

  // Fetch students with all necessary relations
  const students = await prisma.student.findMany({
    where: {
      classId: {
        in: classIds
      },
      status: 'ACTIVE'
    },
    include: {
      grade: true,
      class: true,
      studentCategories: true,
      specialProgrammes: true,
      excessFees: {
        where: {
          isUsed: false,
          OR: [
            {
              academicYearId,
              termId
            },
            {
              academicYearId,
              termId: ""
            }
          ]
        }
      }
    }
  });

  if (!students.length) {
    return [];
  }

  const studentIds = students.map(s => s.id);
  // const gradeIds = students.map(s => s.gradeId).filter(Boolean);

  // Build fee structure query
  const feeStructureWhere: Prisma.FeeStructureWhereInput = {
    academicYearId,
    termId,
    isActive: true,
    ...(feeStructureIds?.length && {
      id: {
        in: feeStructureIds
      }
    })
  };

  // Fetch all related data concurrently
  const [feeStructures, feeStatuses, activeExceptions] = await Promise.all([
    prisma.feeStructure.findMany({
      where: feeStructureWhere,
      include: {
        feeType: true,
        categories: true,
        grades: true,
        classes: true,
        specialProgrammes: true
      }
    }),

    prisma.feeStatus.findMany({
      where: {
        studentId: { in: studentIds },
        academicYearId,
        termId
      },
      include: {
        payments: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    }),

    prisma.feeException.findMany({
      where: {
        studentId: { in: studentIds },
        isActive: true,
        startDate: { lte: new Date() },
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } }
        ]
      }
    })
  ]);

  const result = students.map(student => {
    // Filter fee structures applicable to this student
    const studentFeeStructures = feeStructures.filter(fs => {
      // First check: Student Category based fees
      const hasCategories = fs.categories.length > 0;
      if (hasCategories) {
        const matchingCategories = fs.categories.some(category =>
          student.studentCategories.some(studentCategory => 
            studentCategory.id === category.id
          )
        );
        if (matchingCategories) return true;
      }

      // Second check: Special Programme based fees
      const hasSpecialProgrammes = fs.specialProgrammes.length > 0;
      if (hasSpecialProgrammes) {
        const matchingProgrammes = fs.specialProgrammes.some(programme =>
          student.specialProgrammes.some(studentProgramme => 
            studentProgramme.id === programme.id
          )
        );
        if (matchingProgrammes) return true;
      }

      // Final check: Grade/Class based fees
      // Only check these if no category or special programme matches were found
      if (!hasCategories && !hasSpecialProgrammes) {
        const matchingGrade = fs.grades.some(g => g.id === student.gradeId);
        const matchingClass = fs.classes.some(c => c.id === student.classId) || fs.classes.length === 0;
        return matchingGrade || matchingClass;
      }

      return false;
    });

    const studentFeeStatuses = feeStatuses.filter(fs => fs.studentId === student.id);
    const studentExceptions = activeExceptions.filter(e => e.studentId === student.id);
    const totalExcessFees = student.excessFees.reduce((sum, excess) => sum + excess.amount, 0);

    let totalOriginalAmount = 0;
    let totalApplicableAmount = 0;
    let totalPaidAmount = 0;
    let totalRemainingAmount = 0;

    const fees = studentFeeStructures.map(structure => {
      const feeStatus = studentFeeStatuses.find(fs => fs.feeStructureId === structure.id);
      const exception = studentExceptions.find(e => e.feeStructureId === structure.id);
      
      const originalAmount = structure.amount;
      const paidAmount = feeStatus?.paidAmount || 0;
      const dueAmount = originalAmount;
      const remainingAmount = Math.max(0, dueAmount - paidAmount);
      const applicableAmount = dueAmount;

      // Update totals
      totalOriginalAmount += originalAmount;
      totalApplicableAmount += applicableAmount;
      totalPaidAmount += paidAmount;
      totalRemainingAmount += remainingAmount;
    
      return {
        feeStructureId: structure.id,
        feeType: structure.feeType.name,
        originalAmount,
        applicableAmount,
        dueAmount,
        paidAmount,
        remainingAmount,
        dueDate: structure.dueDate,
        isOverdue: structure.dueDate < new Date(),
        hasException: !!exception,
        exception: exception ? {
          id: exception.id,
          createdAt: exception.createdAt,
          updatedAt: exception.updatedAt,
          studentId: exception.studentId,
          amount: exception.amount,
          isActive: exception.isActive,
          feeStructureId: exception.feeStructureId,
          reason: exception.reason,
          startDate: exception.startDate,
          endDate: exception.endDate
        } : null,
        status: feeStatus?.status || 'PENDING',
        lastPayment: feeStatus?.payments[0] || null
      };
    });

    // Filter for unpaid fees only
    const unpaidFees = fees.filter(fee => fee.remainingAmount > 0);

    const finalRemainingAmount = Math.max(0, totalRemainingAmount - totalExcessFees);

    return {
      student: {
        id: student.id,
        upi: student.upi,
        admissionNumber: student.admissionNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        grade: student.grade.levelName,
        class: student.class?.name,
        gender: student.gender,
        status: student.status,
        categories: student.studentCategories.map(c => c.name),
        specialProgrammes: student.specialProgrammes.map(p => p.name)
      },
      feeSummary: {
        totalOriginalAmount,
        totalApplicableAmount,
        totalPaidAmount,
        totalRemainingAmount,
        availableExcessFees: totalExcessFees,
        finalRemainingAmount
      },
      unpaidFees
    };
  }).filter(studentResult => studentResult.unpaidFees.length > 0);

  return result;
}