// fee-actions.ts
"use server";
// types.ts
export interface UnpaidFeeStudent {
  studentId: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  feeTypes: {
    id: string;
    name: string;
    amount: number;
    paid: number;
    balance: number;
    feeTemplateId: string;
    exceptionInfo: string | null;
  }[];
  totalBalance: number;
  creditBalance: number;
  netBalance: number;
}

export interface PaymentInput {
  studentId: string;
  amount: number;
  feeTemplateIds: string[];
  academicYearId: number;
  termId: string;
  useCreditBalance: boolean;
}

export interface PaymentResult {
  success: boolean;
  message?: string;
  transactionId?: string;
}

import prisma from "@/lib/prisma";


export async function getUnpaidFees({
  academicYearId,
  termId,
  classIds,
  feeTypeIds,
}: {
  academicYearId: number;
  termId: string;
  classIds: number[];
  feeTypeIds: string[];
}): Promise<UnpaidFeeStudent[]> {
  try {
    const currentDate = new Date();

    const feeTemplates = await prisma.feeTemplate.findMany({
      where: {
        academicYearId,
        termId,
        feeTypeId: { in: feeTypeIds },
        feeTemplateGradeClasses: {
          some: { classId: { in: classIds } }
        },
        isActive: true,
      },
      include: {
        feeType: true,
        exceptions: {
          where: {
            status: 'ACTIVE',
            startDate: { lte: currentDate },
            OR: [
              { endDate: { gte: currentDate } },
              { endDate: null },
            ],
          },
        },
        specialProgramme: true,
        feeTemplateGradeClasses: {
          include: {
            grade: true,
            class: true,
          }
        },
      },
    });

    const students = await prisma.student.findMany({
      where: {
        classId: { in: classIds },
        status: "ACTIVE",
      },
      include: {
        feeTransactions: {
          where: {
            academicYearId,
            termId,
          },
          include: {
            allocations: true,
          },
        },
        specialProgrammes: true,
        feeExceptions: {
          where: {
            status: 'ACTIVE',
            startDate: { lte: currentDate },
            OR: [
              { endDate: { gte: currentDate } },
              { endDate: null },
            ],
          },
        },
        studentCreditBalances: true,
      },
    });


    const unpaidFeeStudents: UnpaidFeeStudent[] = students
      .map((student) => {
        const applicableFeeTemplates = feeTemplates.filter(template => 
          template.feeTemplateGradeClasses.some(ftgc => 
            ftgc.classId === student.classId
          ) &&
          (!template.specialProgrammeId || student.specialProgrammes.some(sp => 
            sp.id === template.specialProgrammeId
          ))
        );

        const feeTypeBalances = applicableFeeTemplates
          .map((template) => {
            const totalPaid = student.feeTransactions
              .flatMap((t) => t.allocations)
              .filter((a) => a.feeTemplateId === template.id)
              .reduce((sum, a) => sum + a.amountAllocated, 0);

            const studentException = student.feeExceptions.find(
              (e) => e.feeTemplateId === template.id
            );

            let adjustedAmount = template.baseAmount;
            let exceptionInfo: string | null = null;
            if (studentException) {
              if (studentException.adjustmentType === 'PERCENTAGE') {
                adjustedAmount *= (1 - studentException.adjustmentValue / 100);
                exceptionInfo = `${studentException.adjustmentValue}% discount`;
              } else if (studentException.adjustmentType === 'FIXED_AMOUNT') {
                adjustedAmount -= studentException.adjustmentValue;
                exceptionInfo = `${studentException.adjustmentValue} fixed discount`;
              }
            }

            return {
              id: template.feeTypeId,
              name: template.feeType.name,
              amount: template.baseAmount,
              adjustedAmount: adjustedAmount,
              paid: totalPaid,
              balance: adjustedAmount - totalPaid,
              feeTemplateId: template.id,
              exceptionInfo,
              specialProgramme: template.specialProgramme?.name || null,
            };
          })
          .filter((fee) => fee.balance > 0);
          const totalBalance = feeTypeBalances.reduce(
            (sum, fee) => sum + fee.balance,
            0
          );
  
          const creditBalance = student.studentCreditBalances.reduce(
            (sum, balance) => sum + balance.amount,
            0
          );
        const netBalance = Math.max(totalBalance - creditBalance, 0);

        return {
          studentId: student.id,
          admissionNumber: student.admissionNumber,
          firstName: student.firstName,
          lastName: student.lastName,
          feeTypes: feeTypeBalances,
          totalBalance: totalBalance,
          creditBalance: creditBalance,
          netBalance: netBalance,
        };
      })
      .filter((student) => student.netBalance > 0);

    return unpaidFeeStudents;
  } catch (error) {
    console.error('Error in getUnpaidFees:', error);
    throw error;
  }
}


export async function processBulkPayment(
  payments: PaymentInput[]
): Promise<PaymentResult> {
  try {
    const results = await prisma.$transaction(async (tx) => {
      const processedPayments = [];

      for (const payment of payments) {
        // Get student's current credit balance
        const studentCreditBalance = await tx.studentCreditBalance.findUnique({
          where: { studentId: payment.studentId },
        });

        let amountToAllocate = payment.amount;
        let usedCreditBalance = 0;

        // If using credit balance, add it to the amount to allocate
        if (payment.useCreditBalance && studentCreditBalance) {
          usedCreditBalance = Math.min(studentCreditBalance.amount, payment.amount);
          amountToAllocate += usedCreditBalance;
        }

        // Get fee templates and balances
        const feeTemplates = await tx.feeTemplate.findMany({
          where: {
            id: { in: payment.feeTemplateIds },
            isActive: true,
          },
          include: {
            feeType: true,
          },
        });

        // Calculate balances
        const balances = await Promise.all(
          feeTemplates.map(async (template) => {
            const paid = await tx.feeAllocation.aggregate({
              where: {
                feeTemplateId: template.id,
                transaction: {
                  studentId: payment.studentId,
                },
              },
              _sum: {
                amountAllocated: true,
              },
            });

            return {
              template,
              balance: template.baseAmount - (paid._sum.amountAllocated || 0),
            };
          })
        );

        // Sort by oldest first
        balances.sort(
          (a, b) =>
            a.template.createdAt.getTime() - b.template.createdAt.getTime()
        );

        // Calculate allocations
        let remainingAmount = amountToAllocate;
        const allocations = [];

        for (const { template, balance } of balances) {
          if (remainingAmount <= 0) break;

          const allocationAmount = Math.min(balance, remainingAmount);
          if (allocationAmount > 0) {
            allocations.push({
              feeTemplateId: template.id,
              amountAllocated: allocationAmount,
            });
            remainingAmount -= allocationAmount;
          }
        }

        // Handle credit balance
        if (payment.useCreditBalance && studentCreditBalance) {
          await tx.studentCreditBalance.update({
            where: { studentId: payment.studentId },
            data: {
              amount: {
                decrement: usedCreditBalance,
              },
            },
          });
        }

        // Add remaining amount to credit balance if any
        if (remainingAmount > 0) {
          await tx.studentCreditBalance.upsert({
            where: {
              studentId: payment.studentId,
            },
            create: {
              studentId: payment.studentId,
              amount: remainingAmount,
            },
            update: {
              amount: {
                increment: remainingAmount,
              },
            },
          });
        }

        // Create transaction
        const transaction = await tx.feeTransaction.create({
          data: {
            amount: payment.amount,
            // creditBalanceUsed: usedCreditBalance,
            paymentDate: new Date(),
            method: usedCreditBalance > 0 ? "CREDITBALANCE" : "BULK",
            studentId: payment.studentId,
            feeTemplateId: feeTemplates[0].id, // Using first template as primary
            termId: payment.termId,
            academicYearId: payment.academicYearId,
            status: "COMPLETED",
            receiptNumber: await generateReceiptNumber(tx),
            balance: remainingAmount,
            isPartialPayment: allocations.length < balances.length,
            allocations: {
              create: allocations,
            },
          },
        });

        processedPayments.push(transaction);
      }

      return processedPayments;
    });

    return {
      success: true,
      message: `Successfully processed ${results.length} payments`,
    };
  } catch (error) {
    console.error("Error processing bulk payment:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to process payments",
    };
  }
}

async function generateReceiptNumber(tx: any) {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");

  const lastReceipt = await tx.feeTransaction.findFirst({
    where: {
      receiptNumber: {
        startsWith: `R${year}${month}`,
      },
    },
    orderBy: {
      receiptNumber: "desc",
    },
  });

  let sequence = 1;
  if (lastReceipt) {
    sequence = parseInt(lastReceipt.receiptNumber.slice(-4)) + 1;
  }

  return `R${year}${month}${sequence.toString().padStart(4, "0")}`;
}
