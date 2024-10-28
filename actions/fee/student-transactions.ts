// 'use server'
// import prisma from "@/lib/prisma";

// export interface StudentTransaction {
//     id: string;
//     amount: number;
//     paymentDate: Date;
//     method: string;
//     receiptNumber: string;
//     allocations: {
//       feeTypeName: string;
//       amountAllocated: number;
//     }[];
//   }
  
//   export async function getStudentTransactions({
//     studentId,
//     academicYearId,
//     termId,
//   }: {
//     studentId: string;
//     academicYearId: number;
//     termId: string;
//   }): Promise<StudentTransaction[]> {
//     try {
//       const transactions = await prisma.feeTransaction.findMany({
//         where: {
//           studentId,
//           academicYearId,
//           termId,
//         },
//         select: {
//           id: true,
//           amount: true,
//           paymentDate: true,
//           method: true,
//           receiptNumber: true,
//           allocations: {
//             select: {
//               amountAllocated: true,
//               feeTemplate: {
//                 select: {
//                   feeType: {
//                     select: {
//                       name: true,
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//         orderBy: {
//           paymentDate: 'desc',
//         },
//       });
  
//       return transactions.map((transaction) => ({
//         id: transaction.id,
//         amount: transaction.amount,
//         paymentDate: transaction.paymentDate,
//         method: transaction.method,
//         receiptNumber: transaction.receiptNumber,
//         allocations: transaction.allocations.map((allocation) => ({
//           feeTypeName: allocation.feeTemplate.feeType.name,
//           amountAllocated: allocation.amountAllocated,
//         })),
//       }));
//     } catch (error) {
//       console.error("Error in getStudentTransactions:", error);
//       throw error;
//     }
//   }