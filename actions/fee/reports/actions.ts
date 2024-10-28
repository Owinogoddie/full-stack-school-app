// "use server";

// import prisma from "@/lib/prisma";
// import { PaymentStatus, Prisma } from "@prisma/client";

// // Interfaces
// export interface AcademicYear {
//   id: number;
//   year: string;
// }

// export interface Term {
//   id: string;
//   name: string;
//   academicYearId: number;
// }

// export interface Grade {
//   id: number;
//   levelName: string;
// }

// export interface CollectionFilters {
//   academicYearId?: number;
//   termId?: string;
//   gradeId?: number;
// }

// export interface CollectionSummary {
//   totalCollected: number;
//   totalPending: number;
//   totalOverdue: number;
//   collectionByMonth: {
//     month: string;
//     collected: number;
//     pending: number;
//   }[];
//   collectionByClass: {
//     className: string;
//     collected: number;
//     pending: number;
//     studentCount: number;
//   }[];
//   collectionByGrade: {
//     gradeName: string;
//     collected: number;
//     pending: number;
//     studentCount: number;
//   }[];
//   collectionByFeeType: {
//     feeType: string;
//     amount: number;
//     percentage: number;
//   }[];
// }

// export async function getAcademicYears(): Promise<AcademicYear[]> {
//   return await prisma.academicYear.findMany({
//     orderBy: { year: 'desc' },
//     select: { id: true, year: true }
//   });
// }

// export async function getTermsByAcademicYear(academicYearId: number): Promise<Term[]> {
//   return await prisma.term.findMany({
//     where: { academicYearId },
//     select: { id: true, name: true, academicYearId: true }
//   });
// }

// export async function getGrades(): Promise<Grade[]> {
//   return await prisma.grade.findMany({
//     select: { id: true, levelName: true }
//   });
// }

// export async function getCollectionSummary(
//   filters: CollectionFilters
// ): Promise<CollectionSummary> {
//   try {
//     const { academicYearId, termId, gradeId } = filters;

//     // Base where condition for transactions
//     const baseWhereCondition: Prisma.FeeTransactionWhereInput = {
//       ...(academicYearId && { academicYearId }),
//       ...(termId && { termId }),
//       status: PaymentStatus.COMPLETED,
//     };

//     // Get total collected amount
//     const totalCollectedResult = await prisma.feeTransaction.aggregate({
//       where: baseWhereCondition,
//       _sum: {
//         amount: true
//       }
//     });
//     const totalCollected = totalCollectedResult._sum.amount ?? 0;

//     // Get total pending amount
//     const pendingTransactions = await prisma.feeTransaction.aggregate({
//       where: {
//         ...baseWhereCondition,
//         balance: {
//           gt: 0
//         }
//       },
//       _sum: {
//         balance: true
//       }
//     });
//     const totalPending = pendingTransactions._sum.balance ?? 0;

//     // Get overdue amount
//     const totalOverdueResult = await prisma.feeTransaction.aggregate({
//       where: {
//         ...baseWhereCondition,
//         paymentDate: {
//           lt: new Date()
//         },
//         balance: {
//           gt: 0
//         }
//       },
//       _sum: {
//         balance: true
//       }
//     });
//     const totalOverdue = totalOverdueResult._sum.balance ?? 0;

//     // Collection by month
//     const sixMonthsAgo = new Date();
//     sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

//     const monthlyTransactions = await prisma.feeTransaction.findMany({
//       where: {
//         ...baseWhereCondition,
//         paymentDate: {
//           gte: sixMonthsAgo
//         }
//       },
//       select: {
//         paymentDate: true,
//         amount: true,
//         balance: true
//       }
//     });

//     // Process monthly collections
//     const monthlyMap = new Map<string, { collected: number; pending: number }>();
//     monthlyTransactions.forEach(transaction => {
//       const monthKey = new Date(transaction.paymentDate).toLocaleString('default', { month: 'short' });
//       const existing = monthlyMap.get(monthKey) || { collected: 0, pending: 0 };
//       monthlyMap.set(monthKey, {
//         collected: existing.collected + (transaction.amount ?? 0),
//         pending: existing.pending + (transaction.balance ?? 0)
//       });
//     });

//     const collectionByMonth = Array.from(monthlyMap.entries()).map(([month, data]) => ({
//       month,
//       collected: data.collected,
//       pending: data.pending
//     }));

//     // Collection by class/grade
//     let collectionByClass: any[] = [];
//     let collectionByGrade: any[] = [];

//     if (gradeId) {
//         const classTransactions = await prisma.feeTransaction.findMany({
//           where: {
//             ...baseWhereCondition,
//             student: {
//               class: {
//                 gradeId
//               }
//             }
//           },
//           include: {
//             student: {
//               include: {
//                 class: true
//               }
//             }
//           }
//         });
      
//         const classMap = new Map<string, { 
//           collected: number; 
//           pending: number; 
//           students: Set<string> 
//         }>();
      
//         classTransactions.forEach(transaction => {
//           if (transaction.student?.class) {
//             const className = transaction.student.class.name;
//             const existing = classMap.get(className) || { 
//               collected: 0, 
//               pending: 0, 
//               students: new Set<string>() 
//             };
      
//             existing.students.add(transaction.studentId);
            
//             classMap.set(className, {
//               collected: existing.collected + (transaction.amount ?? 0),
//               pending: existing.pending + (transaction.balance ?? 0),
//               students: existing.students
//             });
//           }
//         });
      
//         collectionByClass = Array.from(classMap.entries()).map(([className, data]) => ({
//           className,
//           collected: data.collected,
//           pending: data.pending,
//           studentCount: data.students.size
//         }));
//       } else {
//         const gradeTransactions = await prisma.feeTransaction.findMany({
//           where: baseWhereCondition,
//           include: {
//             student: {
//               include: {
//                 class: {
//                   include: {
//                     grade: true
//                   }
//                 }
//               }
//             }
//           }
//         });
      
//         const gradeMap = new Map<string, { 
//           collected: number; 
//           pending: number; 
//           students: Set<string> 
//         }>();
      
//         gradeTransactions.forEach(transaction => {
//           if (transaction.student?.class?.grade) {
//             const gradeName = transaction.student.class.grade.levelName;
//             const existing = gradeMap.get(gradeName) || { 
//               collected: 0, 
//               pending: 0, 
//               students: new Set<string>() 
//             };
      
//             existing.students.add(transaction.studentId);
            
//             gradeMap.set(gradeName, {
//               collected: existing.collected + (transaction.amount ?? 0),
//               pending: existing.pending + (transaction.balance ?? 0),
//               students: existing.students
//             });
//           }
//         });
      
//         collectionByGrade = Array.from(gradeMap.entries()).map(([gradeName, data]) => ({
//           gradeName,
//           collected: data.collected,
//           pending: data.pending,
//           studentCount: data.students.size
//         }));
//       }

//     // Collection by fee type
//     const feeTypeTransactions = await prisma.feeAllocation.findMany({
//       where: {
//         transaction: baseWhereCondition
//       },
//       include: {
//         feeTemplate: {
//           include: {
//             feeType: true
//           }
//         }
//       }
//     });

//     const feeTypeMap = new Map<string, number>();
//     feeTypeTransactions.forEach(allocation => {
//       const feeTypeName = allocation.feeTemplate.feeType.name;
//       const existing = feeTypeMap.get(feeTypeName) || 0;
//       feeTypeMap.set(feeTypeName, existing + (allocation.amountAllocated ?? 0));
//     });

//     const totalFeeTypeAmount = Array.from(feeTypeMap.values()).reduce((sum, amount) => sum + amount, 0);

//     const collectionByFeeType = Array.from(feeTypeMap.entries()).map(([feeType, amount]) => ({
//       feeType,
//       amount,
//       percentage: totalFeeTypeAmount > 0 ? Math.round((amount / totalFeeTypeAmount) * 100) : 0
//     }));

//     return {
//       totalCollected,
//       totalPending,
//       totalOverdue,
//       collectionByMonth,
//       collectionByClass,
//       collectionByGrade,
//       collectionByFeeType
//     };

//   } catch (error) {
//     console.error("Error fetching collection summary:", error);
//     throw error;
//   }
// }