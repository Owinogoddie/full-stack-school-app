"use server";

import prisma from "@/lib/prisma";

interface FeeWithBalance {
  feeId: string;
  balance: number;
  originalAmount: number;
}

interface PaymentAllocation {
  feeId: string;
  amount: number;
}

export interface PaymentInput {
  studentId: string;
  amount: number;
  feeIds: string[];
  academicYearId: number;
  termId: string;
  useCreditBalance: boolean;
}

export interface PaymentResult {
  success: boolean;
  message?: string;
  transactionId?: string;
}

export async function processBulkPayment(
  payments: PaymentInput[]
): Promise<PaymentResult[]> {
  try {
    return await prisma.$transaction(async (tx: any) => {
      const results = await Promise.all(
        payments.map(payment => processStudentPayment(payment, tx))
      );
      return results;
    });
  } catch (error) {
    console.error('Bulk payment processing error:', error);
    throw error;
  }
}

async function processStudentPayment(
    payment: PaymentInput,
    tx: any
  ): Promise<PaymentResult> {
    try {
      const student = await tx.student.findUnique({
        where: { id: payment.studentId },
        include: {
          studentCreditBalances: true,
          ledgerEntries: {
            where: {
              academicYearId: payment.academicYearId,
              termId: payment.termId,
            },
          },
        },
      });
  
      if (!student) {
        throw new Error('Student not found');
      }
  
      let availableCreditBalance = 0;
      if (payment.useCreditBalance) {
        availableCreditBalance = student.studentCreditBalances[0]?.amount ?? 0;
      }
  
      const feesWithBalances = await calculateFeesWithBalances(
        tx,
        student.id,
        payment.feeIds,
        payment.academicYearId,
        payment.termId
      );
  
      const totalAmount = payment.amount + availableCreditBalance;
      const { allocations, remainingCredit } = calculatePaymentAllocations(
        feesWithBalances,
        totalAmount,
        payment.feeIds
      );
  
  
      // Create separate payments for each fee
      const paymentRecords = await Promise.all(
        allocations.map(async (allocation, index) => {
          const uniqueReceiptNumber = await generateReceiptNumber(tx, index);
          return await tx.payment.create({
            data: {
              amount: allocation.amount,
              paymentDate: new Date(),
              receiptNumber: uniqueReceiptNumber, // Use the unique receipt number
              paymentMethod: 'CASH',
              status: 'COMPLETED',
              student: {
                connect: {
                  id: student.id
                }
              },
              fee: {
                connect: {
                  id: allocation.feeId
                }
              }
            },
          });
        })
      );
  
      // Create fee transactions for each payment
      await Promise.all(
        paymentRecords.map(async (paymentRecord) => {
          return await tx.feeTransaction.create({
            data: {
              amount: paymentRecord.amount,
              transactionType: 'PAYMENT',
              description: 'Fee payment',
              payment: {
                connect: {
                  id: paymentRecord.id
                }
              },
              term: {
                connect: {
                  id: payment.termId
                }
              },
              academicYear: {
                connect: {
                  id: payment.academicYearId
                }
              }
            }
          });
        })
      );
      if (payment.useCreditBalance && availableCreditBalance > 0) {
        await processCreditBalanceUsage(
          tx,
          student.id,
          availableCreditBalance,
          payment.academicYearId,
          payment.termId,
          paymentRecords[0].id // Use first payment record as reference
        );
      }
  
      // Create ledger entries
      await Promise.all(
        paymentRecords.map(async (paymentRecord, index) => {
          await tx.ledgerEntry.create({
            data: {
              studentId: student.id,
              date: new Date(),
              entryType: 'CREDIT_ADDED',
              description: 'Fee payment',
              debit: 0,
              credit: paymentRecord.amount,
              runningBalance: 212300, // You might want to calculate this
              feeId: allocations[index].feeId,
              paymentId: paymentRecord.id,
              academicYearId: payment.academicYearId,
              termId: payment.termId,
              postedBy: 'SYSTEM'
            }
          });
        })
      );
  
      if (remainingCredit > 0) {
        await updateStudentCreditBalance(tx, student.id, remainingCredit);
      }
  
      // Create audit log for the entire transaction
      await createAuditLogs(
        tx,
        student.id,
        paymentRecords[0].id,
        allocations,
        payment,
        availableCreditBalance
      );
  
      return {
        success: true,
        message: `Payment processed successfully. Receipt: `,
        transactionId: paymentRecords[0].id
      };
  
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

async function calculateFeesWithBalances(
  tx: any,
  studentId: string,
  feeIds: string[],
  academicYearId: number,
  termId: string
): Promise<FeeWithBalance[]> {
  const fees = await tx.fee.findMany({
    where: {
      id: { in: feeIds },
      academicYearId,
      termId,
    },
  });

  const ledgerEntries = await tx.ledgerEntry.findMany({
    where: {
      studentId,
      feeId: { in: feeIds },
      academicYearId,
      termId,
    },
  });

  return fees.map((fee: any) => {
    const feeEntries = ledgerEntries.filter((entry: any) => entry.feeId === fee.id);
    const totalPaid = feeEntries.reduce(
      (sum: any, entry: any) => sum + Number(entry.credit) - Number(entry.debit),
      0
    );
    return {
      feeId: fee.id,
      originalAmount: Number(fee.amount),
      balance: Number(fee.amount) - totalPaid
    };
  });
}

function calculatePaymentAllocations(
  feesWithBalances: FeeWithBalance[],
  totalAmount: number,
  priorityFeeIds: string[]
): { allocations: PaymentAllocation[], remainingCredit: number } {
  let remainingAmount = totalAmount;
  const allocations: PaymentAllocation[] = [];

  priorityFeeIds.forEach(feeId => {
    const fee = feesWithBalances.find(f => f.feeId === feeId);
    if (fee && fee.balance > 0 && remainingAmount > 0) {
      const allocation = Math.min(fee.balance, remainingAmount);
      allocations.push({ feeId, amount: allocation });
      remainingAmount -= allocation;
    }
  });

  feesWithBalances
    .filter(fee => !priorityFeeIds.includes(fee.feeId))
    .forEach(fee => {
      if (fee.balance > 0 && remainingAmount > 0) {
        const allocation = Math.min(fee.balance, remainingAmount);
        allocations.push({ feeId: fee.feeId, amount: allocation });
        remainingAmount -= allocation;
      }
    });

  return {
    allocations,
    remainingCredit: remainingAmount
  };
}

async function generateReceiptNumber(tx: any, index: number): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    const lastReceipt = await tx.payment.findFirst({
      where: {
        receiptNumber: {
          startsWith: `RCP${year}${month}${day}`
        }
      },
      orderBy: {
        receiptNumber: 'desc'
      }
    });
  
    const baseSequence = lastReceipt 
      ? parseInt(lastReceipt.receiptNumber.slice(-4))
      : 0;
  
    // Add index to make each receipt number unique within the batch
    const sequence = (baseSequence + index + 1).toString().padStart(4, '0');
  
    return `RCP${year}${month}${day}${sequence}`;
  }
  
async function processCreditBalanceUsage(
    tx: any,
    studentId: string,
    amount: number,
    academicYearId: number,
    termId: string,
    paymentId: string
  ) {
    await tx.studentCreditBalance.update({
      where: { studentId },
      data: {
        amount: {
          decrement: amount
        }
      }
    });
  
    await tx.ledgerEntry.create({
      data: {
        date: new Date(),
        entryType: 'CREDIT_USED',
        description: 'Credit balance applied to payment',
        debit: amount,
        credit: 0,
        runningBalance: 123,
        student: {
          connect: { id: studentId }
        },
        academicYear: {
          connect: { id: academicYearId }
        },
        term: {
          connect: { id: termId }
        },
        payment: {
          connect: { id: paymentId }
        },
        postedBy: 'SYSTEM'
      }
    });
  }
//   async function createLedgerEntries(
//     tx: any,
//     studentId: string,
//     allocations: PaymentAllocation[],
//     paymentId: string,
//     academicYearId: number,
//     termId: string
//   ) {
//     for (const allocation of allocations) {
//       await tx.ledgerEntry.create({
//         data: {
//           date: new Date(),
//           entryType: 'PAYMENT',
//           description: 'Fee payment',
//           debit: 0,
//           credit: allocation.amount,
//           runningBalance: 0,
//           student: {
//             connect: { id: studentId }
//           },
//           fee: {
//             connect: { id: allocation.feeId }
//           },
//           payment: {
//             connect: { id: paymentId }
//           },
//           academicYear: {
//             connect: { id: academicYearId }
//           },
//           term: {
//             connect: { id: termId }
//           },
//           postedBy: 'SYSTEM'
//         }
//       });
//     }
//   }
async function updateStudentCreditBalance(
  tx: any,
  studentId: string,
  amount: number
) {
  const existingBalance = await tx.studentCreditBalance.findUnique({
    where: { studentId }
  });

  if (existingBalance) {
    await tx.studentCreditBalance.update({
      where: { studentId },
      data: {
        amount: {
          increment: amount
        }
      }
    });
  } else {
    await tx.studentCreditBalance.create({
      data: {
        studentId,
        amount
      }
    });
  }
}

async function createAuditLogs(
  tx: any,
  studentId: string,
  paymentId: string,
  allocations: PaymentAllocation[],
  payment: PaymentInput,
  usedCreditBalance: number
) {
  await tx.feeAuditLog.create({
    data: {
      entityType: 'PAYMENT',
      entityId: paymentId,
      action: 'PAYMENT',
      changes: JSON.stringify({
        studentId,
        amount: payment.amount,
        usedCreditBalance,
        allocations
      }),
      performedBy: 'SYSTEM',
      oldValues: null,
      newValues: JSON.stringify({
        paymentId,
        allocations
      })
    }
  });
}