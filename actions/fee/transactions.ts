'use server'

import  prisma  from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getStudentTransactions(studentId: string) {
  return await prisma.feeTransaction.findMany({
    where: { studentId },
    include: {
      allocations: {
        include: { feeTemplate: { include: { feeType: true } } }
      }
    },
    orderBy: { paymentDate: 'desc' }
  })
}

export async function updateTransaction(
    transactionId: string,
    data: {
      amount: number
      paymentDate: Date
      method: string
      allocations: { id: string; feeTemplateId: string; amountAllocated: number }[]
    }
  ) {
    try {
      // Validate input data
      if (data.amount <= 0) throw new Error("Invalid amount");
      if (data.allocations.some(a => a.amountAllocated <= 0)) throw new Error("Invalid allocation amount");
  
      const result = await prisma.$transaction(async (tx) => {
        // Fetch the original transaction
        const originalTransaction = await tx.feeTransaction.findUnique({
          where: { id: transactionId },
          include: { allocations: true }
        });
        if (!originalTransaction) throw new Error("Transaction not found");
  
        // Update transaction
         await tx.feeTransaction.update({
          where: { id: transactionId },
          data: {
            amount: data.amount,
            paymentDate: data.paymentDate,
            method: data.method,
          },
        });
  
        // Process allocations
        const allocationUpdates = data.allocations.map(async (allocation) => {
          const existingAllocation = originalTransaction.allocations.find(
            a => a.feeTemplateId === allocation.feeTemplateId
          );
  
          if (existingAllocation) {
            // Update existing allocation
            return tx.feeAllocation.update({
              where: { id: existingAllocation.id },
              data: { amountAllocated: allocation.amountAllocated },
            });
          } else {
            // Create new allocation
            return tx.feeAllocation.create({
              data: {
                transactionId,
                feeTemplateId: allocation.feeTemplateId,
                amountAllocated: allocation.amountAllocated,
              },
            });
          }
        });
  
        // Delete allocations that are no longer present
        const allocationsToDelete = originalTransaction.allocations.filter(
          a => !data.allocations.some(newA => newA.feeTemplateId === a.feeTemplateId)
        );
  
        await Promise.all([
          ...allocationUpdates,
          ...allocationsToDelete.map(a => tx.feeAllocation.delete({ where: { id: a.id } }))
        ]);
  
        // Recalculate balance and isPartialPayment
        const totalAllocated = data.allocations.reduce((sum, a) => sum + a.amountAllocated, 0);
        const balance = data.amount - totalAllocated;
        const isPartialPayment = balance > 0;
  
        // Update transaction with new balance and isPartialPayment
        return tx.feeTransaction.update({
          where: { id: transactionId },
          data: { balance, isPartialPayment },
          include: {
            allocations: {
              include: {
                feeTemplate: {
                  include: {
                    feeType: true
                  }
                }
              }
            }
          }
        });
      });
  
      revalidatePath('/student-transactions');
      return { success: true, data: result };
    } catch (error) {
      console.error('Failed to update transaction:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update transaction' 
      };
    }
  }