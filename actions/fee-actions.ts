// 'use server'

// import { prisma } from '@/lib/prisma'
// import { revalidatePath } from 'next/cache'

// export async function calculateStudentFees(
//   studentId: string,
//   academicYearId: number,
//   termId: string
// ) {
//   // Get applicable templates
//   const templates = await prisma.feeTemplate.findMany({
//     where: {
//       academicYearId,
//       termId,
//       isActive: true,
//       OR: [
//         {
//           grades: {
//             hasSome: [student.gradeId]
//           }
//         },
//         {
//           classes: {
//             hasSome: [student.classId]
//           }
//         },
//         {
//           studentCategories: {
//             hasSome: [student.categoryId]
//           }
//         }
//       ]
//     },
//     include: {
//       exceptions: {
//         where: {
//           studentId,
//           OR: [
//             { endDate: null },
//             { endDate: { gt: new Date() } }
//           ]
//         }
//       }
//     }
//   })

//   // Calculate totals considering exceptions
//   const feeDetails = templates.map(template => {
//     const exception = template.exceptions[0]
//     const actualAmount = exception?.adjustedAmount ?? template.baseAmount
    
//     return {
//       templateId: template.id,
//       originalAmount: template.baseAmount,
//       adjustedAmount: actualAmount,
//       hasException: !!exception
//     }
//   })

//   // Get payments made
//   const transactions = await prisma.feeTransaction.findMany({
//     where: {
//       studentId,
//       academicYearId,
//       termId
//     }
//   })

//   // Calculate balances
//   const totalDue = feeDetails.reduce((sum, fee) => sum + fee.adjustedAmount, 0)
//   const totalPaid = transactions.reduce((sum, tx) => sum + tx.amount, 0)
//   const balance = totalDue - totalPaid

//   return {
//     feeDetails,
//     transactions,
//     summary: {
//       totalDue,
//       totalPaid,
//       balance
//     }
//   }
// }

// export async function createFeeTemplate(data: Omit<FeeTemplate, 'id' | 'version'>) {
//   const template = await prisma.feeTemplate.create({
//     data: {
//       ...data,
//       version: 1
//     }
//   })
//   revalidatePath('/dashboard/fees/templates')
//   return template
// }

// export async function recordPayment(data: {
//   studentId: string
//   amount: number
//   method: PaymentMethod
//   feeTemplateId: string
//   termId: string
//   academicYearId: number
//   notes?: string
// }) {
//   // Generate receipt number
//   const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

//   // Get current balance
//   const { summary } = await calculateStudentFees(
//     data.studentId,
//     data.academicYearId,
//     data.termId
//   )

//   const newBalance = summary.balance - data.amount
//   const status = newBalance <= 0 ? 'PAID' : 'PARTIALLY_PAID'

//   const transaction = await prisma.feeTransaction.create({
//     data: {
//       ...data,
//       receiptNumber,
//       status,
//       balance: newBalance,
//       isPartialPayment: newBalance > 0,
//       paymentDate: new Date()
//     }
//   })

//   revalidatePath('/dashboard/fees/transactions')
//   return transaction
// }