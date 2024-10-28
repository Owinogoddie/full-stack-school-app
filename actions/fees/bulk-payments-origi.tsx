
'use server'
import prisma from "@/lib/prisma";
import { ExcessFee } from "@prisma/client";
export interface PaymentInput {
  studentId: string;
  amount: number;
  feestructureIds: string[];
  academicYearId: number;
  termId: string;
  useCreditBalance: boolean;
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



export async function processBulkPayments(payments: PaymentInput[]): Promise<PaymentResult[]> {
  const results: PaymentResult[] = [];
  
  for (const payment of payments) {
    try {
      const result = await processBulkPayment(payment);
      results.push(result);
    } catch (error) {
      results.push({
        success: false,
        message: error instanceof Error ? error.message : 'Payment processing failed'
      });
    }
  }
  
  return results;
}




export async function processBulkPayment(input: PaymentInput): Promise<PaymentResult> {
  const { studentId, amount, feestructureIds, academicYearId, termId, useCreditBalance } = input;

  return await prisma.$transaction(async (tx) => {
    try {
      // 1. Get fee structures with their types
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
          dueDate: 'asc' // Process earlier due dates first
        }
      });

      if (!feeStructures.length) {
        return { 
          success: false, 
          message: 'No valid fee structures found' 
        };
      }

      // 2. Get available credit balance if enabled
      let availableCredit = 0;
      let excessFees: ExcessFee[] = [];
      if (useCreditBalance) {
        excessFees = await tx.excessFee.findMany({
          where: {
            studentId,
            isUsed: false,
           
          },
          orderBy: { createdAt: 'asc' }
        });
        availableCredit = excessFees.reduce((sum, excess) => sum + excess.amount, 0);
      }

      // 3. Get active fee exceptions
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

      // 4. Process each fee structure and prepare for distribution
      const feeStatusUpdates = [];
      let totalUnpaidAmount = 0;

      for (const feeStructure of feeStructures) {
        // Check for exceptions
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

      // 5. Distribute available payment across fee structures
      let remainingPayment = amount;
      let creditUsed = 0;
      const paymentDetails = [];
      const usedExcessFees: { id: string, amountUsed: number }[] = [];

      for (const feeUpdate of feeStatusUpdates) {
        if (remainingPayment <= 0 && availableCredit <= 0) break;

        // Calculate how much we can pay for this fee
        let amountForThis = Math.min(feeUpdate.remainingAmount, remainingPayment);
        
        // Use credit if needed and available
        if (amountForThis < feeUpdate.remainingAmount && availableCredit > 0) {
          const creditToUse = Math.min(
            feeUpdate.remainingAmount - amountForThis,
            availableCredit
          );

          // Track credit usage from excess fees
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
          await tx.payment.create({
            data: {
              studentId,
              feeStatusId: feeUpdate.feeStatus.id,
              amount: amountForThis,
              academicYearId,
              termId,
              paymentType: 'CASH',
              status: 'COMPLETED',
              dueDate: feeUpdate.feeStatus.dueDate
            }
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

          paymentDetails.push({
            feeType: feeUpdate.feeType,
            amountPaid: amountForThis
          });

          remainingPayment -= (amountForThis - creditUsed);
        }
      }

      // 6. Update used excess fees
      for (const usedFee of usedExcessFees) {
        const excessFee = excessFees.find(ef => ef.id === usedFee.id)!;
        
        if (usedFee.amountUsed === excessFee.amount) {
          await tx.excessFee.update({
            where: { id: usedFee.id },
            data: { isUsed: true }
          });
        } else {
          // Split the excess fee record
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

      // 7. Handle any remaining payment as excess
      if (remainingPayment > 0) {
        await tx.excessFee.create({
          data: {
            studentId,
            amount: remainingPayment,
            academicYearId,
            termId,
            description: 'Excess from partial payment'
          }
        });
      }

      return {
        success: true,
        message: 'Payment processed successfully',
        paymentDetails: {
          totalPaid: amount,
          feesPaid: paymentDetails,
          remainingUnpaid: totalUnpaidAmount - (amount + creditUsed),
          creditUsed: creditUsed > 0 ? creditUsed : undefined,
          excessAmount: remainingPayment > 0 ? remainingPayment : undefined
        }
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  });
}