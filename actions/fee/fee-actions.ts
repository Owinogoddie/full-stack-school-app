// interface FeeTemplateVersion {
//     id: string;
//     feeTemplateId: string;
//     version: number;
//     baseAmount: number;
//     effectiveDate: Date;
//     changes: {
//       field: string;
//       oldValue: any;
//       newValue: any;
//     }[];
//     reason?: string;
//     createdBy: string;
//   }
  
//   // Server action to update template
//   export async function updateFeeTemplate(
//     templateId: string,
//     updates: Partial<FeeTemplateVersion>,
//     reason?: string
//   ) {
//     const currentTemplate = await prisma.feeTemplate.findUnique({
//       where: { id: templateId },
//       include: { history: true }
//     });
  
//     if (!currentTemplate) throw new Error("Template not found");
  
//     // Create new version
//     const newVersion = currentTemplate.version + 1;
  
//     // Record changes in history
//     await prisma.feeHistory.create({
//       data: {
//         feeTemplateId: templateId,
//         previousAmount: currentTemplate.baseAmount,
//         newAmount: updates.baseAmount || currentTemplate.baseAmount,
//         changeDate: new Date(),
//         reason,
//         version: newVersion,
//         changes: Object.entries(updates).map(([field, value]) => ({
//           field,
//           oldValue: currentTemplate[field],
//           newValue: value
//         }))
//       }
//     });
  
//     // Update template with new version
//     return prisma.feeTemplate.update({
//       where: { id: templateId },
//       data: {
//         ...updates,
//         version: newVersion
//       }
//     });
//   }
  
//   // Get template at specific version
//   export async function getFeeTemplateVersion(
//     templateId: string,
//     version?: number
//   ) {
//     const template = await prisma.feeTemplate.findUnique({
//       where: { id: templateId },
//       include: {
//         history: {
//           orderBy: { version: 'desc' }
//         }
//       }
//     });
  
//     if (!template) throw new Error("Template not found");
  
//     if (!version) return template; // Current version
  
//     const historicalVersion = template.history.find(h => h.version === version);
//     if (!historicalVersion) throw new Error("Version not found");
  
//     return {
//       ...template,
//       ...historicalVersion,
//       baseAmount: historicalVersion.newAmount
//     };
//   }
// //   Enhanced Fee Calculation with Exceptions:
//   interface FeeCalculation {
//     original: number;
//     adjustments: {
//       type: string;
//       amount: number;
//       reason: string;
//     }[];
//     final: number;
//   }
  
//   export async function calculateStudentFees(
//     studentId: string,
//     academicYearId: number,
//     termId: string
//   ) {
//     // Get student details
//     const student = await prisma.student.findUnique({
//       where: { id: studentId },
//       include: {
//         grade: true,
//         class: true,
//         category: true
//       }
//     });
  
//     if (!student) throw new Error("Student not found");
  
//     // Get applicable templates
//     const templates = await prisma.feeTemplate.findMany({
//       where: {
//         academicYearId,
//         termId,
//         isActive: true,
//         OR: [
//           { grades: { hasSome: [student.grade.id] } },
//           { classes: { hasSome: [student.class.id] } },
//           { studentCategories: { hasSome: [student.category.id] } }
//         ]
//       },
//       include: {
//         exceptions: {
//           where: {
//             studentId,
//             status: 'ACTIVE',
//             startDate: { lte: new Date() },
//             OR: [
//               { endDate: null },
//               { endDate: { gt: new Date() } }
//             ]
//           }
//         },
//         feeType: true
//       }
//     });
  
//     // Calculate fees for each template
//     const calculations = await Promise.all(templates.map(async template => {
//       const activeExceptions = template.exceptions;
//       let finalAmount = template.baseAmount;
//       const adjustments = [];
  
//       // Apply exceptions in order
//       for (const exception of activeExceptions) {
//         const adjustment = exception.adjustmentType === 'PERCENTAGE'
//           ? template.baseAmount * (exception.adjustmentValue / 100)
//           : exception.adjustmentValue;
  
//         adjustments.push({
//           type: exception.type,
//           amount: adjustment,
//           reason: exception.reason
//         });
  
//         finalAmount = exception.adjustmentType === 'PERCENTAGE'
//           ? finalAmount * (1 - exception.adjustmentValue / 100)
//           : finalAmount - exception.adjustmentValue;
//       }
  
//       // Get payments for this template
//       const payments = await prisma.feeTransaction.findMany({
//         where: {
//           studentId,
//           feeTemplateId: template.id,
//           academicYearId,
//           termId
//         }
//       });
  
//       const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  
//       return {
//         templateId: template.id,
//         feeType: template.feeType,
//         calculation: {
//           original: template.baseAmount,
//           adjustments,
//           final: finalAmount
//         },
//         payments: {
//           total: totalPaid,
//           transactions: payments
//         },
//         balance: finalAmount - totalPaid
//       };
//     }));
  
//     // Calculate totals
//     const summary = calculations.reduce((sum, calc) => ({
//       totalOriginal: sum.totalOriginal + calc.calculation.original,
//       totalFinal: sum.totalFinal + calc.calculation.final,
//       totalPaid: sum.totalPaid + calc.payments.total,
//       totalBalance: sum.totalBalance + calc.balance
//     }), {
//       totalOriginal: 0,
//       totalFinal: 0,
//       totalPaid: 0,
//       totalBalance: 0
//     });
  
//     return {
//       studentInfo: {
//         id: student.id,
//         name: student.name,
//         grade: student.grade.name,
//         class: student.class.name,
//         category: student.category.name
//       },
//       calculations,
//       summary
//     };
//   }

// //   Enhanced Payment Recording:
// interface PaymentAllocation {
//     feeTypeId: string;
//     amount: number;
//   }
  
//   export async function recordPayment(data: {
//     studentId: string;
//     academicYearId: number;
//     termId: string;
//     totalAmount: number;
//     method: PaymentMethod;
//     allocations: PaymentAllocation[];
//     notes?: string;
//   }) {
//     // Validate total amount matches allocations
//     const totalAllocated = data.allocations.reduce((sum, a) => sum + a.amount, 0);
//     if (totalAllocated !== data.totalAmount) {
//       throw new Error("Allocated amounts don't match total payment");
//     }
  
//     // Start transaction
//     return prisma.$transaction(async (tx) => {
//       // Generate receipt number
//       const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
//       // Create main transaction record
//       const mainTransaction = await tx.feeTransaction.create({
//         data: {
//           studentId: data.studentId,
//           amount: data.totalAmount,
//           method: data.method,
//           receiptNumber,
//           academicYearId: data.academicYearId,
//           termId: data.termId,
//           notes: data.notes,
//           status: 'COMPLETED',
//           paymentDate: new Date()
//         }
//       });
  
//       // Record allocations
//       const allocationRecords = await Promise.all(
//         data.allocations.map(async allocation => {
//           // Find applicable template for fee type
//           const template = await tx.feeTemplate.findFirst({
//             where: {
//               feeTypeId: allocation.feeTypeId,
//               academicYearId: data.academicYearId,
//               termId: data.termId,
//               isActive: true
//             }
//           });
  
//           if (!template) {
//             throw new Error(`No active template found for fee type ${allocation.feeTypeId}`);
//           }
  
//           // Create allocation record
//           return tx.paymentAllocation.create({
//             data: {
//               transactionId: mainTransaction.id,
//               feeTemplateId: template.id,
//               amount: allocation.amount
//             }
//           });
//         })
//       );
  
//       // Update student balances
//       await updateStudentBalances(tx, data.studentId, data.academicYearId, data.termId);
  
//       return {
//         transaction: mainTransaction,
//         allocations: allocationRecords
//       };
//     });
//   }

// //   Fee History:
// export async function createFeeHistory(
//     templateId: string,
//     changes: {
//       field: string;
//       oldValue: any;
//       newValue: any;
//     }[],
//     reason?: string
//   ) {
//     return prisma.feeHistory.create({
//       data: {
//         feeTemplateId: templateId,
//         changes,
//         reason,
//         timestamp: new Date()
//       }
//     });
//   }
  
//   export async function getFeeHistory(
//     templateId: string,
//     options?: {
//       startDate?: Date;
//       endDate?: Date;
//       includeChanges?: boolean;
//     }
//   ) {
//     return prisma.feeHistory.findMany({
//       where: {
//         feeTemplateId: templateId,
//         timestamp: {
//           gte: options?.startDate,
//           lte: options?.endDate
//         }
//       },
//       orderBy: {
//         timestamp: 'desc'
//       },
//       include: {
//         template: options?.includeChanges
//       }
//     });
//   }

// //   Enhanced Fee History and Analysis:
// // Types
// interface FeeHistory {
//     id: string;
//     feeTemplateId: string;
//     timestamp: Date;
//     changes: {
//       field: string;
//       oldValue: any;
//       newValue: any;
//     }[];
//     reason: string;
//     affectedStudents?: number;
//     financialImpact?: {
//       totalChange: number;
//       averagePerStudent: number;
//     };
//   }
  
//   // Enhanced History Service
//   export const feeHistoryService = {
//     async create(data: {
//       templateId: string,
//       changes: any[],
//       reason: string
//     }) {
//       // Calculate impact
//       const template = await prisma.feeTemplate.findUnique({
//         where: { id: data.templateId },
//         include: {
//           grades: true,
//           classes: true,
//           studentCategories: true
//         }
//       });
  
//       // Count affected students
//       const affectedStudents = await prisma.student.count({
//         where: {
//           OR: [
//             { gradeId: { in: template.grades.map(g => g.id) } },
//             { classId: { in: template.classes.map(c => c.id) } },
//             { categoryId: { in: template.studentCategories.map(sc => sc.id) } }
//           ]
//         }
//       });
  
//       // Calculate financial impact
//       const financialChange = data.changes.find(c => c.field === 'baseAmount');
//       const financialImpact = financialChange ? {
//         totalChange: (financialChange.newValue - financialChange.oldValue) * affectedStudents,
//         averagePerStudent: financialChange.newValue - financialChange.oldValue
//       } : undefined;
  
//       return prisma.feeHistory.create({
//         data: {
//           feeTemplateId: data.templateId,
//           changes: data.changes,
//           reason: data.reason,
//           affectedStudents,
//           financialImpact
//         }
//       });
//     },
  
//     // Analysis Methods
//     async analyzeTemplateChanges(templateId: string, period: { start: Date, end: Date }) {
//       const history = await prisma.feeHistory.findMany({
//         where: {
//           feeTemplateId: templateId,
//           timestamp: { gte: period.start, lte: period.end }
//         },
//         orderBy: { timestamp: 'asc' }
//       });
  
//       return {
//         totalChanges: history.length,
//         amountChanges: history.filter(h => 
//           h.changes.some(c => c.field === 'baseAmount')
//         ).length,
//         totalImpact: history.reduce((sum, h) => 
//           sum + (h.financialImpact?.totalChange || 0), 0
//         ),
//         changeFrequency: history.length / 
//           ((period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60 * 24 * 30)), // Changes per month
//         mostCommonReasons: Object.entries(
//           history.reduce((acc, h) => {
//             acc[h.reason] = (acc[h.reason] || 0) + 1;
//             return acc;
//           }, {} as Record<string, number>)
//         ).sort(([,a], [,b]) => b - a).slice(0, 5)
//       };
//     },
  
//     async generateAuditReport(period: { start: Date, end: Date }) {
//       const changes = await prisma.feeHistory.findMany({
//         where: {
//           timestamp: { gte: period.start, lte: period.end }
//         },
//         include: {
//           feeTemplate: true
//         },
//         orderBy: { timestamp: 'asc' }
//       });
  
//       return {
//         period,
//         totalChanges: changes.length,
//         byTemplate: changes.reduce((acc, change) => {
//           const key = change.feeTemplate.name;
//           acc[key] = (acc[key] || 0) + 1;
//           return acc;
//         }, {} as Record<string, number>),
//         totalFinancialImpact: changes.reduce((sum, c) => 
//           sum + (c.financialImpact?.totalChange || 0), 0
//         ),
//         timeline: changes.map(c => ({
//           date: c.timestamp,
//           template: c.feeTemplate.name,
//           changes: c.changes,
//           reason: c.reason,
//           impact: c.financialImpact
//         }))
//       };
//     }
//   };