// // Fee Exception Scenarios:
// // Scenario 1: Sibling Discount
// async function applySiblingDiscount(studentId: string) {
//     const student = await prisma.student.findUnique({
//       where: { id: studentId },
//       include: { family: { include: { students: true } } }
//     });
  
//     if (student.family.students.length > 1) {
//       // Apply 10% discount to all fee templates
//       const templates = await prisma.feeTemplate.findMany({
//         where: { isActive: true }
//       });
  
//       for (const template of templates) {
//         await feeExceptionService.create({
//           feeTemplateId: template.id,
//           studentId,
//           type: 'DISCOUNT',
//           adjustmentType: 'PERCENTAGE',
//           adjustmentValue: 10,
//           reason: 'Sibling discount',
//           startDate: new Date(),
//           approvedBy: 'SYSTEM',
//           documents: []
//         });
//       }
//     }
//   }
  
//   // Scenario 2: Scholarship
//   async function applyScholarship(studentId: string, scholarshipData: {
//     percentage: number,
//     reason: string,
//     documents: string[]
//   }) {
//     const templates = await prisma.feeTemplate.findMany({
//       where: { 
//         isActive: true,
//         feeType: { category: 'TUITION' } // Only apply to tuition fees
//       }
//     });
  
//     for (const template of templates) {
//       await feeExceptionService.create({
//         feeTemplateId: template.id,
//         studentId,
//         type: 'SCHOLARSHIP',
//         adjustmentType: 'PERCENTAGE',
//         adjustmentValue: scholarshipData.percentage,
//         reason: scholarshipData.reason,
//         startDate: new Date(),
//         approvedBy: 'SCHOLARSHIP_COMMITTEE',
//         documents: scholarshipData.documents
//       });
//     }
//   }
  
//   // Scenario 3: Financial Hardship
//   async function applyHardshipWaiver(
//     studentId: string,
//     amount: number,
//     endDate: Date,
//     documents: string[]
//   ) {
//     const templates = await prisma.feeTemplate.findMany({
//       where: { isActive: true }
//     });
  
//     for (const template of templates) {
//       await feeExceptionService.create({
//         feeTemplateId: template.id,
//         studentId,
//         type: 'WAIVER',
//         adjustmentType: 'FIXED_AMOUNT',
//         adjustmentValue: amount,
//         reason: 'Financial hardship',
//         startDate: new Date(),
//         endDate,
//         approvedBy: 'FINANCIAL_AID_OFFICE',
//         documents
//       });
//     }
//   }