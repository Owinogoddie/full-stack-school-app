'use server'
import prisma from "@/lib/prisma";
import { ExcessFee, Payment } from "@prisma/client";

export interface PaymentInput {
  studentId: string;
  amount: number;
  feestructureIds: string[];
  academicYearId: number;
  termId: string;
  useCreditBalance: boolean;
  performedBy?: string;
  paymentType: 'CASH' | 'BANK' | 'MOBILE_MONEY' | 'CHEQUE' | 'OTHER';
  reference?: string;  
}

export interface PaymentResult {
  success: boolean;
  message?: string;
  paymentDetails?: {
    totalPaid: number;
    feesPaid: {
      feeType: string;
      amountPaid: number;
    }[];
    excessAmount?: number;
    creditUsed?: number;
  };
}

interface AuditLogData {
  entityType: string;
  entityId: string;
  action: string;
  changes: Record<string, any>;
  performedBy: string;
  oldValues: any;
  newValues: any;
}

async function createAuditLog(tx: any, logData: AuditLogData) {
  try {
    return await tx.feeAuditLog.create({
      data: {
        entityType: logData.entityType,
        entityId: logData.entityId,
        action: logData.action,
        changes: JSON.stringify(logData.changes),
        performedBy: logData.performedBy || 'SYSTEM',
        oldValues: JSON.stringify(logData.oldValues),
        newValues: JSON.stringify(logData.newValues),
      }
    });
  } catch (error) {
    console.error('Audit log creation failed:', error);
  }
}

export async function processBulkPayment(input: PaymentInput): Promise<PaymentResult> {
  const { studentId, amount, feestructureIds, academicYearId, termId, useCreditBalance, performedBy } = input;

  console.error('🟦 STARTING BULK PAYMENT PROCESSING:', new Date().toISOString());
  console.error('Input received:', { studentId, amount, feestructureIds, useCreditBalance });

  return await prisma.$transaction(async (tx) => {
    try {
      // 1. Validate input data
      if (!studentId || !amount || amount <= 0 || !feestructureIds.length) {
        throw new Error('Invalid input parameters');
      }

      // 2. Get fee structures with their types
      const feeStructures = await tx.feeStructure.findMany({
        where: {
          id: { in: feestructureIds },
          academicYearId,
          termId
        },
        include: {
          feeType: true
        },
        orderBy: {
          dueDate: 'asc'
        }
      });

      if (!feeStructures.length) {
        throw new Error('No valid fee structures found');
      }

      // 3. Get available credit balance
      let availableCredit = 0;
      const excessFees: ExcessFee[] = [];
      if (useCreditBalance) {
        await tx.excessFee.updateMany({
          where: {
            studentId,
            academicYearId,
            termId,
            isUsed: false
          },
          data: {
            isUsed: true
          }
        });

        await createAuditLog(tx, {
          entityType: "EXCESS_FEE",
          entityId: studentId,
          action: "UPDATE_BULK",
          changes: { isUsed: true },
          performedBy: performedBy || 'SYSTEM',
          oldValues: { isUsed: false },
          newValues: { isUsed: true }
        });
      }

      // 4. Process fees and prepare distribution
      
      
      const feeStatusUpdates = [];
      // let totalUnpaidAmount = 0;
      const paymentDetails: { feeType: string; amountPaid: number }[] = [];
      let remainingPayment = amount;
      let creditUsed = 0;

      for (const feeStructure of feeStructures) {
        const dueAmount = feeStructure.amount;

        let feeStatus = await tx.feeStatus.findFirst({
          where: {
            studentId,
            feeStructureId: feeStructure.id,
            academicYearId,
            termId
          }
        });

        if (!feeStatus) {
          feeStatus = await tx.feeStatus.create({
            data: {
              studentId,
              feeStructureId: feeStructure.id,
              academicYearId,
              termId,
              dueAmount,
              paidAmount: 0,
              dueDate: feeStructure.dueDate,
              status: 'PENDING'
            }
          });
        }

        const remainingAmount = dueAmount - feeStatus.paidAmount;
        if (remainingAmount > 0) {
          // totalUnpaidAmount += remainingAmount;
          feeStatusUpdates.push({
            feeStatus,
            dueAmount,
            remainingAmount,
            feeType: feeStructure.feeType.name
          });
        }
      }

      // 5. Process payments
      const paymentRecords: Payment[] = [];
      let excessFeeRecord: ExcessFee | null = null;

      for (const feeUpdate of feeStatusUpdates) {
        console.error('\n🟩 Processing fee update:', {
          remainingPayment,
          availableCredit,
          feeType: feeUpdate.feeType,
          remainingAmount: feeUpdate.remainingAmount
        });

        if (remainingPayment <= 0 && availableCredit <= 0) {
          console.error('No remaining payment or credit, breaking');
          break;
        }

        let amountForThis = Math.min(feeUpdate.remainingAmount, remainingPayment);
        console.error('Initial amount for this fee:', amountForThis);

        // Credit usage section
        if (amountForThis < feeUpdate.remainingAmount && availableCredit > 0) {
          console.error('\n🟨 CREDIT USAGE SECTION START');
          console.error('Initial values:', {
            amountForThis,
            remainingAmount: feeUpdate.remainingAmount,
            availableCredit
          });

          const creditNeeded = Math.min(
            feeUpdate.remainingAmount - amountForThis,
            availableCredit
          );

          console.error('Credit needed:', creditNeeded);

          if (creditNeeded > 0) {
            let remainingCreditNeeded = creditNeeded;
            console.error('Processing excess fees with remaining credit needed:', remainingCreditNeeded);

            for (const excess of excessFees) {
              console.error('\n🟦 Processing excess fee:', {
                excessId: excess.id,
                excessAmount: excess.amount,
                remainingCreditNeeded
              });

              if (remainingCreditNeeded <= 0) {
                console.error('No more credit needed');
                break;
              }

              const amountToUseFromThis = Math.min(excess.amount, remainingCreditNeeded);
              console.error('Will use from this excess:', amountToUseFromThis);
              
              if (amountToUseFromThis === excess.amount) {
                console.error('Using entire excess fee - marking as used');
                await tx.excessFee.update({
                  where: { id: excess.id },
                  data: { isUsed: true }
                });
              } else {
                const newAmount = excess.amount - amountToUseFromThis;
                console.error('Using partial excess fee:', {
                  original: excess.amount,
                  used: amountToUseFromThis,
                  remaining: newAmount
                });
                await tx.excessFee.update({
                  where: { id: excess.id },
                  data: { amount: newAmount }
                });
              }

              amountForThis += amountToUseFromThis;
              availableCredit -= amountToUseFromThis;
              creditUsed += amountToUseFromThis;
              remainingCreditNeeded -= amountToUseFromThis;

              console.error('Updated totals:', {
                amountForThis,
                availableCredit,
                creditUsed,
                remainingCreditNeeded
              });
            }
          }
          console.error('🟨 CREDIT USAGE SECTION END\n');
        }

        if (amountForThis > 0) {
          console.error('Creating payment record:', { amountForThis });
          const payment = await tx.payment.create({
            data: {
              studentId,
              feeStatusId: feeUpdate.feeStatus.id,
              amount: amountForThis,
              academicYearId,
              termId,
              paymentType: input.paymentType,
              reference: input.reference,       
              status: 'COMPLETED',
              dueDate: feeUpdate.feeStatus.dueDate,
              hasExcessFee: false,
              excessAmount: 0
            }
          });

          await createAuditLog(tx, {
            entityType: "PAYMENT",
            entityId: payment.id,
            action: "CREATE",
            changes: { amount: amountForThis },
            performedBy: performedBy || 'SYSTEM',
            oldValues: null,
            newValues: payment
          });

          const newPaidAmount = feeUpdate.feeStatus.paidAmount + amountForThis;
          await tx.feeStatus.update({
            where: { id: feeUpdate.feeStatus.id },
            data: {
              paidAmount: newPaidAmount,
              status: newPaidAmount >= feeUpdate.dueAmount ? 'COMPLETED' : 'PARTIAL',
              lastPayment: new Date()
            }
          });

          paymentRecords.push(payment);
          paymentDetails.push({
            feeType: feeUpdate.feeType,
            amountPaid: amountForThis
          });

          remainingPayment -= (amountForThis - creditUsed);
        }
      }
// console.log({remainingPayment},"lllllllllllllllllllllllllllllllllllllllll")
      // 6. Handle excess amount
      if (remainingPayment > 0) {
        console.error('Creating excess fee record for remaining payment:', remainingPayment);
        
        // First, mark all existing excess fees for this student as used
        // await tx.excessFee.updateMany({
        //   where: {
        //     studentId,
        //     academicYearId,
        //     termId,
        //     isUsed: false,
        //     // Optionally, you might want to exclude very recent excess fees
        //     createdAt: {
        //       lt: new Date()
        //     }
        //   },
        //   data: {
        //     isUsed: true
        //   }
        // });
      
        // Then create the new excess fee record
        excessFeeRecord = await tx.excessFee.create({
          data: {
            studentId,
            amount: remainingPayment,
            academicYearId,
            termId,
            description: 'Excess from payment',
            isUsed: false
          }
        });
      
        // Create audit log for marking previous excess fees as used
        await createAuditLog(tx, {
          entityType: "EXCESS_FEE",
          entityId: studentId, // Using studentId as this affects multiple records
          action: "UPDATE_BULK",
          changes: { isUsed: true },
          performedBy: performedBy || 'SYSTEM',
          oldValues: { isUsed: false },
          newValues: { isUsed: true }
        });
      
        // Create audit log for new excess fee
        await createAuditLog(tx, {
          entityType: "EXCESS_FEE",
          entityId: excessFeeRecord.id,
          action: "CREATE",
          changes: { amount: remainingPayment },
          performedBy: performedBy || 'SYSTEM',
          oldValues: null,
          newValues: excessFeeRecord
        });
      
        if (paymentRecords.length > 0) {
          const lastPayment = paymentRecords[paymentRecords.length - 1];
          await tx.payment.update({
            where: { id: lastPayment.id },
            data: {
              hasExcessFee: true,
              excessAmount: remainingPayment,
              generatedExcessFeeId: excessFeeRecord.id
            }
          });
        }
      }

      console.error('🟩 PAYMENT PROCESSING COMPLETED SUCCESSFULLY');
      return {
        success: true,
        message: 'Payment processed successfully',
        paymentDetails: {
          totalPaid: amount,
          feesPaid: paymentDetails,
          creditUsed: creditUsed > 0 ? creditUsed : undefined,
          excessAmount: remainingPayment > 0 ? remainingPayment : undefined,
        }
      };

    } catch (error) {
      console.error('🟥 PAYMENT PROCESSING ERROR:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  });
}

export async function processBulkPayments(payments: PaymentInput[]): Promise<PaymentResult[]> {
  const results: PaymentResult[] = [];
  
  for (const payment of payments) {
    try {
      const result = await processBulkPayment(payment);
      results.push(result);
    } catch (error) {
      console.error('Bulk payment processing error:', error);
      results.push({
        success: false,
        message: error instanceof Error ? error.message : 'Payment processing failed'
      });
    }
  }
  
  return results;
}