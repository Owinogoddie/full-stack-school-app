"use server";

import prisma from "@/lib/prisma";

// Types
export interface UnpaidFeeStudent {
  studentId: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  fees: {
    feeId: string;
    name: string;         // Fee name (e.g., "Tuition Fee Term 1")
    description: string | null;
    amount: number;
    paid: number;
    balance: number;
    exceptionInfo: string | null;
  }[];
  totalBalance: number;
  creditBalance: number;
}

export async function getUnpaidFees({
  academicYearId,
  termId,
  classIds,
  feeIds,
}: {
  academicYearId: number;
  termId: string;
  classIds: number[];
  feeIds: string[];
}): Promise<UnpaidFeeStudent[]> {
  try {
    const currentDate = new Date();

    // 1. Get all relevant fees
    const fees = await prisma.fee.findMany({
      where: {
        AND: [
          { id: { in: feeIds } },
          { academicYearId },
          { termId },
          {
            OR: [
              { classes: { some: { id: { in: classIds } } } },
              { grades: { some: { classes: { some: { id: { in: classIds } } } } } }
            ]
          }
        ]
      },
      include: {
        classes: true,
        grades: {
          include: {
            classes: true
          }
        }
      }
    });

    // 2. Get students with their payment records
    const students = await prisma.student.findMany({
      where: {
        classId: { in: classIds },
        status: "ACTIVE",
      },
      include: {
        ledgerEntries: {
          where: {
            academicYearId,
            termId,
            feeId: { in: feeIds }
          },
        },
        feeExceptions: {
          where: {
            status: 'ACTIVE',
            startDate: { lte: currentDate },
            OR: [
              { endDate: { gte: currentDate } },
              { endDate: null },
            ],
            feeId: { in: feeIds }
          },
        },
        studentCreditBalances: true,
      },
    });

    // 3. Process each student
    const unpaidFeeStudents: UnpaidFeeStudent[] = students
      .map((student:any) => {
        // Get applicable fees for this student
        const applicableFees = fees.filter((fee:any) => 
          fee.classes.some((cls:any) => cls.id === student.classId) ||
          fee.grades.some((grade:any) => 
            grade.classes.some((cls:any) => cls.id === student.classId)
          )
        );

        const feeBalances = applicableFees.map((fee:any) => {
          // Calculate payments from ledger entries
          const totalPaid = student.ledgerEntries
            .filter((entry:any) => entry.feeId === fee.id)
            .reduce((sum:any, entry:any) => 
              sum + Number(entry.credit) - Number(entry.debit), 
              0
            );

          // Check for exceptions
          const exception = student.feeExceptions.find(
            (e:any) => e.feeId === fee.id
          );

          let adjustedAmount = Number(fee.amount);
          let exceptionInfo: string | null = null;

          // Apply exception if exists
          if (exception) {
            if (exception.amountType === 'PERCENTAGE' && exception.percentage) {
              adjustedAmount *= (1 - exception.percentage / 100);
              exceptionInfo = `${exception.percentage}% discount`;
            } else if (exception.amountType === 'FIXED' && exception.amount) {
              adjustedAmount -= exception.amount;
              exceptionInfo = `${exception.amount} fixed discount`;
            }
          }

          const balance = adjustedAmount - totalPaid;

          // Only return fees with remaining balance
          return balance > 0 ? {
            feeId: fee.id,
            name: fee.name,
            description: fee.description,
            amount: Number(fee.amount),
            paid: totalPaid,
            balance,
            exceptionInfo,
          } : null;
        }).filter((fee:any): fee is NonNullable<typeof fee> => fee !== null);

        // Calculate total outstanding balance
        const totalBalance = feeBalances.reduce(
          (sum:any, fee:any) => sum + fee.balance,
          0
        );

        // Get current credit balance
        const creditBalance = student.studentCreditBalances[0]?.amount ?? 0;

        return {
          studentId: student.id,
          admissionNumber: student.admissionNumber,
          firstName: student.firstName,
          lastName: student.lastName,
          fees: feeBalances,
          totalBalance,
          creditBalance,
        };
      })
      .filter((student:any) => student.fees.length > 0);

    return unpaidFeeStudents;
  } catch (error) {
    console.error('Error in getUnpaidFees:', error);
    throw error;
  }
}