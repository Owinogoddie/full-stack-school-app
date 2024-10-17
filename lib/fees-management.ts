// import prisma from "./prisma";

// export async function assignFeesToStudent(
//     studentId: string,
//     gradeId: string,
//     classId: string,
//     categoryIds: string[],
//     academicYearId: number,
//     termId: string,
//     itemStatus: 'ACTIVE' | 'FUTURE' | 'INACTIVE' = 'ACTIVE' 
//   ) {
//     try {
//       // Fetch the student to ensure they exist
//       const student = await prisma.student.findUnique({
//         where: { id: studentId },
//       });
  
//       if (!student) {
//         throw new Error(`Student with ID ${studentId} not found`);
//       }
  
//       // Fetch relevant fee templates
//       const feeTemplates = await prisma.feeTemplate.findMany({
//         where: {
//           AND: [
//             { academicYearId: academicYearId },
//             { termId: termId },
//             { grades: { some: { id: Number(gradeId) } } },
//             { classes: { some: { id: Number(classId) } } },
//             { studentCategories: { some: { id: { in: categoryIds } } } },
//           ]
//         },
//         include: {
//           feeType: true,
//           term: true,
//           academicYear: true,
//         }
//       });
  
//       console.log(`Found ${feeTemplates.length} applicable fee templates for student ${studentId}`);
  
//       const createdFeeItems = [];
  
//       // Create fee items based on templates
//       for (const template of feeTemplates) {
//         const feeItem = await prisma.feeItem.create({
//           data: {
//             amount: template.baseAmount,
//             finalAmount: template.baseAmount, // Set finalAmount to baseAmount initially
//             dueDate: template.term.endDate,
//             status: 'PENDING',
//             itemStatus: itemStatus,
//             academicYear: template.academicYear.year,
//             termId: template.termId,
//             studentId: studentId,
//             feeTypeId: template.feeTypeId,
//             effectiveDate: new Date(), // Set to current date, adjust if needed
//           }
//         });
  
//         createdFeeItems.push(feeItem);
//       }
  
//       console.log(`Created ${createdFeeItems.length} fee items for student ${studentId}`);
  
//       return createdFeeItems;
//     } catch (error) {
//       console.error(`Error assigning fees to student ${studentId}:`, error);
//       throw error; // Re-throw the error for handling in the calling function
//     }
//   }