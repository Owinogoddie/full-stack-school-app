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
  performedBy?: string; // Optional user ID for audit
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

// Helper function to create audit logs
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
    // Continue processing even if audit log fails
  }
}

export async function processBulkPayment(input: PaymentInput): Promise<PaymentResult> {
  const { studentId, amount, feestructureIds, academicYearId, termId, useCreditBalance, performedBy } = input;

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
      let excessFees: ExcessFee[] = [];
      if (useCreditBalance) {
        excessFees = await tx.excessFee.findMany({
          where: {
            studentId,
            isUsed: false,
            academicYearId,
            termId
          },
          orderBy: { createdAt: 'asc' }
        });
        availableCredit = excessFees.reduce((sum, excess) => sum + excess.amount, 0);
      }

      // 4. Get fee exceptions
      const exceptions = await tx.feeException.findMany({
        where: {
          studentId,
          feeStructureId: { in: feestructureIds },
          isActive: true,
          startDate: { lte: new Date() },
          OR: [
            { endDate: null },
            { endDate: { gte: new Date() } }
          ]
        }
      });

      // 5. Process fees and prepare distribution
      const feeStatusUpdates = [];
      let totalUnpaidAmount = 0;
      const paymentDetails: { feeType: string; amountPaid: number }[] = [];
      let remainingPayment = amount;
      let creditUsed = 0;

      for (const feeStructure of feeStructures) {
        const exception = exceptions.find(e => e.feeStructureId === feeStructure.id);
        const dueAmount = exception ? exception.amount : feeStructure.amount;

        // Get or create fee status
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
          totalUnpaidAmount += remainingAmount;
          feeStatusUpdates.push({
            feeStatus,
            dueAmount,
            remainingAmount,
            feeType: feeStructure.feeType.name
          });
        }
      }

      // 6. Process payments
      const paymentRecords: Payment[] = [];
      const usedExcessFees: { id: string; amountUsed: number }[] = [];
      let excessFeeRecord: ExcessFee | null = null;

      for (const feeUpdate of feeStatusUpdates) {
        if (remainingPayment <= 0 && availableCredit <= 0) break;

        let amountForThis = Math.min(feeUpdate.remainingAmount, remainingPayment);

        // Handle credit usage
        if (amountForThis < feeUpdate.remainingAmount && availableCredit > 0) {
          const creditToUse = Math.min(
            feeUpdate.remainingAmount - amountForThis,
            availableCredit
          );

          if (creditToUse > 0) {
            let remainingCreditToMark = creditToUse;
            
            for (const excess of excessFees) {
              if (remainingCreditToMark <= 0) break;
              
              const amountToUse = Math.min(excess.amount, remainingCreditToMark);
              usedExcessFees.push({
                id: excess.id,
                amountUsed: amountToUse
              });
              
              remainingCreditToMark -= amountToUse;
            }

            amountForThis += creditToUse;
            availableCredit -= creditToUse;
            creditUsed += creditToUse;
          }
        }

        if (amountForThis > 0) {
          // Create payment record
          const payment = await tx.payment.create({
            data: {
              studentId,
              feeStatusId: feeUpdate.feeStatus.id,
              amount: amountForThis,
              academicYearId,
              termId,
              paymentType: 'CASH',
              status: 'COMPLETED',
              dueDate: feeUpdate.feeStatus.dueDate,
              hasExcessFee: false,
              excessAmount: 0
            }
          });

          // Create audit log
          await createAuditLog(tx, {
            entityType: "PAYMENT",
            entityId: payment.id,
            action: "CREATE",
            changes: { amount: amountForThis },
            performedBy: performedBy || 'SYSTEM',
            oldValues: null,
            newValues: payment
          });

          // Update fee status
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

      // 7. Handle excess amount
      if (remainingPayment > 0) {
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

      // 8. Update used excess fees
      for (const usedFee of usedExcessFees) {
        const excessFee = excessFees.find(ef => ef.id === usedFee.id);
        if (!excessFee) continue;

        if (usedFee.amountUsed === excessFee.amount) {
          await tx.excessFee.update({
            where: { id: usedFee.id },
            data: { isUsed: true }
          });
        } else {
          await tx.excessFee.update({
            where: { id: usedFee.id },
            data: { amount: excessFee.amount - usedFee.amountUsed }
          });

          await tx.excessFee.create({
            data: {
              studentId,
              amount: usedFee.amountUsed,
              academicYearId,
              termId,
              description: 'Used portion of excess fee',
              isUsed: true
            }
          });
        }
      }

      return {
        success: true,
        message: 'Payment processed successfully',
        paymentDetails: {
          totalPaid: amount,
          feesPaid: paymentDetails,
          remainingUnpaid: totalUnpaidAmount - (amount + creditUsed),
          creditUsed: creditUsed > 0 ? creditUsed : undefined,
          excessAmount: remainingPayment > 0 ? remainingPayment : undefined,
          excessFeeId: excessFeeRecord?.id
        }
      };

    } catch (error) {
      console.error('Payment processing error:', error);
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