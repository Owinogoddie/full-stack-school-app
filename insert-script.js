// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// async function insertData(modelName, data) {
//   const model = prisma[modelName];

//   if (!model || typeof model.createMany !== 'function') {
//     throw new Error(`Invalid model name: ${modelName}`);
//   }

//   try {
//     const result = await model.createMany({
//       data: data,
//       skipDuplicates: true,
//     });
//     console.log(`Successfully inserted ${result.count} records into ${modelName}`);
//     return result;
//   } catch (error) {
//     console.error(`Error inserting data into ${modelName}:`, error);
//     throw error;
//   }
// }

// // Usage example
// async function main() {
//   const studentCategories = [
//     {
//       name: "Boarding",
//       description: "Covers all boarding students with accommodation services",
//     },
//     {
//       name: "Day Scholar",
//       description: "Covers all day scholars without boarding services",
//     },
//     {
//       name: "Special Needs",
//       description: "Includes students with special educational needs",
//     },
//     {
//       name: "Scholarship",
//       description: "Includes students under scholarship programs",
//     },
//     {
//       name: "International",
//       description: "Covers students from international backgrounds",
//     }
//   ];

//   await insertData('StudentCategory', studentCategories);
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
