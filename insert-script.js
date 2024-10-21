// const { PrismaClient } = require('@prisma/client');
// const { z } = require('zod');

// const prisma = new PrismaClient();

// // Define the GradeLevel and Stage enums using Zod
// const GradeLevelEnum = z.enum([
//   "PP1",
//   "PLAYGROUP",
//   "PP2",
//   "GRADE1",
//   "GRADE2",
//   "GRADE3",
//   "GRADE4",
//   "GRADE5",
//   "GRADE6",
//   "GRADE7",
//   "GRADE8",
//   "GRADE9",
//   "GRADE10",
//   "GRADE11",
//   "GRADE12",
// ]);

// const StageEnum = z.enum([
//   "PRE_PRIMARY",
//   "PRIMARY",
//   "JUNIOR_SECONDARY",
//   "SENIOR_SECONDARY",
// ]);

// // Function to insert data into a specified model
// async function insertData(modelName, data) {
//   const model = prisma[modelName];

//   if (!model || typeof model.createMany !== 'function') {
//     throw new Error(`Invalid model name: ${modelName}`);
//   }

//   try {
//     const result = await model.createMany({
//       data: data,
//       skipDuplicates: true, // Skips duplicates during insertion
//     });
//     console.log(`Successfully inserted ${result.count} records into ${modelName}`);
//     return result;
//   } catch (error) {
//     console.error(`Error inserting data into ${modelName}:`, error);
//     throw error;
//   }
// }

// // Usage example for inserting grades
// async function main() {
//     const grades = [
//       {
//         levelName: "PLAYGROUP", // Ensure this matches the enum in Prisma
//         stage: StageEnum.enum.PRE_PRIMARY,
//         description: "Early childhood education for young children.",
//       },
//       {
//         levelName: "PP1",
//         stage: StageEnum.enum.PRE_PRIMARY,
//         description: "Preparatory class for preschool students.",
//       },
//       {
//         levelName: "PP2",
//         stage: StageEnum.enum.PRE_PRIMARY,
//         description: "Second preparatory class for preschool students.",
//       },
//       {
//         levelName: "GRADE1",
//         stage: StageEnum.enum.PRIMARY,
//         description: "First grade in primary school.",
//       },
//       {
//         levelName: "GRADE2",
//         stage: StageEnum.enum.PRIMARY,
//         description: "Second grade in primary school.",
//       },
//       {
//         levelName: "GRADE3",
//         stage: StageEnum.enum.PRIMARY,
//         description: "Third grade in primary school.",
//       },
//       {
//         levelName: "GRADE4",
//         stage: StageEnum.enum.PRIMARY,
//         description: "Fourth grade in primary school.",
//       },
//       {
//         levelName: "GRADE5",
//         stage: StageEnum.enum.PRIMARY,
//         description: "Fifth grade in primary school.",
//       },
//       {
//         levelName: "GRADE6",
//         stage: StageEnum.enum.PRIMARY,
//         description: "Sixth grade in primary school.",
//       },
//       {
//         levelName: "GRADE7",
//         stage: StageEnum.enum.JUNIOR_SECONDARY,
//         description: "First year of secondary school.",
//       },
//       {
//         levelName: "GRADE8",
//         stage: StageEnum.enum.JUNIOR_SECONDARY,
//         description: "Second year of secondary school.",
//       },
//       {
//         levelName: "GRADE9",
//         stage: StageEnum.enum.SENIOR_SECONDARY,
//         description: "Third year of secondary school.",
//       },
//       {
//         levelName: "GRADE10",
//         stage: StageEnum.enum.SENIOR_SECONDARY,
//         description: "Fourth year of secondary school.",
//       },
//       {
//         levelName: "GRADE11",
//         stage: StageEnum.enum.SENIOR_SECONDARY,
//         description: "Fifth year of secondary school.",
//       },
//       {
//         levelName: "GRADE12",
//         stage: StageEnum.enum.SENIOR_SECONDARY,
//         description: "Final year of secondary school.",
//       },
//     ];
  
//     // Validate against the Zod schema before insertion
//     grades.forEach((grade) => {
//       GradeLevelEnum.parse(grade.levelName); // Validate levelName
//       StageEnum.parse(grade.stage); // Validate stage
//     });
  
//     await insertData('Grade', grades);
//   }
  
// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
