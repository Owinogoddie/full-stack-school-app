// utils/feeLogger.ts

import  prisma  from './prisma' 

type FeeChangeParams = {
  entityType: 'FEE_TEMPLATE' | 'FEE_EXCEPTION' | 'FEE_TRANSACTION' | 'FEE_TYPE'
  entityId: string
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PAYMENT' | 'ADJUSTMENT'
  changes: any
  performedBy: string
  // Optional parameters for fee amount changes
  feeAmountChange?: {
    feeTemplateId: string
    previousAmount?: number
    newAmount?: number
    reason?: string
  }
}

export async function logFeeChange({
  entityType,
  entityId,
  action,
  changes,
  performedBy,
  feeAmountChange
}: FeeChangeParams) {
  try {
    await prisma.$transaction(async (tx) => {
      // Always create audit log
      await tx.feeAuditLog.create({
        data: {
          entityType,
          entityId,
          action,
          changes: JSON.stringify(changes),
          performedBy,
          metadata: feeAmountChange ? JSON.stringify(feeAmountChange) : null
        }
      })

      // Create fee history only if there's a fee amount change
      if (feeAmountChange) {
        await tx.feeHistory.create({
          data: {
            feeTemplateId: feeAmountChange.feeTemplateId,
            changes: {
              previousAmount: feeAmountChange.previousAmount,
              newAmount: feeAmountChange.newAmount
            },
            reason: feeAmountChange.reason,
            changeDate: new Date(),
          }
        })
      }
    })
  } catch (error) {
    console.error('Error logging fee change:', error)
    throw new Error('Failed to log fee change')
  }
}




















// // app/actions/feeActions.ts

// 'use server'

// import { logFeeChange } from '@/utils/feeLogger'

// export async function updateFeeTemplate(
//   templateId: string,
//   newAmount: number,
//   oldAmount: number,
//   userId: string,
//   reason?: string
// ) {
//   try {
//     const updatedTemplate = await prisma.feeTemplate.update({
//       where: { id: templateId },
//       data: { baseAmount: newAmount }
//     })

//     await logFeeChange({
//       entityType: 'FEE_TEMPLATE',
//       entityId: templateId,
//       action: 'UPDATE',
//       changes: {
//         baseAmount: {
//           from: oldAmount,
//           to: newAmount
//         }
//       },
//       performedBy: userId,
//       feeAmountChange: {
//         feeTemplateId: templateId,
//         previousAmount: oldAmount,
//         newAmount: newAmount,
//         reason
//       }
//     })

//     return { success: true, template: updatedTemplate }
//   } catch (error) {
//     console.error('Failed to update fee template:', error)
//     throw new Error('Failed to update fee template')
//   }
// }