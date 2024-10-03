// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// async function insertData(modelName, data) {
//   const model = prisma[modelName.toLowerCase()];

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
//   const departments = [
//     {
//       name: "Mathematics Department",
//       description: "Focuses on the study of mathematical concepts, theories, and applications, promoting analytical and problem-solving skills.",
//     },
//     {
//       name: "Science Department",
//       description: "Covers various scientific disciplines including physics, chemistry, and biology, emphasizing experimentation and scientific reasoning.",
//     },
//     {
//       name: "Languages Department",
//       description: "Dedicated to the study of languages and literature, enhancing communication skills and cultural understanding.",
//     },
//     {
//       name: "Humanities Department",
//       description: "Explores human culture, history, and philosophy, encouraging critical thinking and ethical reasoning.",
//     },
//     {
//       name: "Technical and Applied Studies Department",
//       description: "Focuses on practical skills and technical knowledge in various fields, preparing students for careers in applied sciences and technology.",
//     },
//     {
//       name: "Physical Education Department",
//       description: "Promotes physical fitness and healthy lifestyles through various sports and physical activities, focusing on teamwork and personal development.",
//     },
//     {
//       name: "Creative Arts Department",
//       description: "Encourages artistic expression through visual arts, music, drama, and dance, fostering creativity and cultural appreciation.",
//     },
//     {
//       name: "ICT and Innovation Department",
//       description: "Focuses on information and communication technology, preparing students for the digital age through coding, software development, and innovation.",
//     },
//     {
//       name: "Special Needs Education Department",
//       description: "Provides specialized education and support for students with diverse learning needs, ensuring inclusivity and equal opportunities.",
//     },
//     {
//       name: "Early Childhood Development Education (ECDE) Department",
//       description: "Focuses on the holistic development of young children, emphasizing foundational skills in social, emotional, and cognitive growth.",
//     },
//     {
//       name: "Guidance and Counselling Department",
//       description: "Offers support for students' personal and academic development, promoting mental health and well-being through counseling services.",
//     },
//   ];

//   await insertData('Department', departments);
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
