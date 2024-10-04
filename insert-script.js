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
//     const subjects = [
//       {
//         name: "English",
//         code: "ENG",
//         description: "Covers language skills in English, including grammar, literature, and composition",
//       },
//       {
//         name: "Kiswahili",
//         code: "KIS",
//         description: "Covers Swahili language skills, including grammar, composition, and literature",
//       },
//       {
//         name: "Mathematics",
//         code: "MAT",
//         description: "Covers basic and advanced mathematics including algebra, geometry, and calculus",
//       },
//       {
//         name: "Biology",
//         code: "BIO",
//         description: "Covers life sciences, including cell biology, ecology, genetics, and evolution",
//       },
//       {
//         name: "Physics",
//         code: "PHY",
//         description: "Covers principles of physics, including mechanics, electricity, magnetism, and optics",
//       },
//       {
//         name: "Chemistry",
//         code: "CHE",
//         description: "Covers chemical reactions, atomic structure, and chemical bonding",
//       },
//       {
//         name: "History",
//         code: "HIS",
//         description: "Covers historical events, both local and global, as well as social studies",
//       },
//       {
//         name: "Geography",
//         code: "GEO",
//         description: "Covers physical and human geography, environmental science, and map reading skills",
//       },
//       {
//         name: "Music",
//         code: "MUS",
//         description: "Covers music theory, composition, and performance",
//       },
//       {
//         name: "Art and Craft",
//         code: "ART",
//         description: "Covers visual arts, painting, drawing, and design",
//       },
//       {
//         name: "Computer Science",
//         code: "CSC",
//         description: "Covers ICT, programming, and digital literacy skills",
//       },
//       {
//         name: "Physical Education",
//         code: "PE",
//         description: "Covers physical fitness, sports, and health education",
//       }
//     ];
  
//     await insertData('Subject', subjects);
//   }
  

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
