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
//  const gradscales=[
//     {
//       "name": "Kenyan National Scale",
//       "letterGrade": "A",
//       "minScore": 80.0,
//       "maxScore": 100.0,
//       "gpa": 4.0,
//       "description": "Excellent performance",
//       "schoolId": null,
//       "subjectId": null,
//       "examType": null,
//       "isDefault": true,
//       "createdAt": "2024-01-01T00:00:00.000Z",
//       "updatedAt": "2024-01-01T00:00:00.000Z"
//     },
//     {
//       "name": "Kenyan National Scale",
//       "letterGrade": "A-",
//       "minScore": 75.0,
//       "maxScore": 79.99,
//       "gpa": 3.7,
//       "description": "Very good performance",
//       "schoolId": null,
//       "subjectId": null,
//       "examType": null,
//       "isDefault": true,
//       "createdAt": "2024-01-01T00:00:00.000Z",
//       "updatedAt": "2024-01-01T00:00:00.000Z"
//     },
//     {
//       "name": "Kenyan National Scale",
//       "letterGrade": "B+",
//       "minScore": 70.0,
//       "maxScore": 74.99,
//       "gpa": 3.3,
//       "description": "Good performance",
//       "schoolId": null,
//       "subjectId": null,
//       "examType": null,
//       "isDefault": true,
//       "createdAt": "2024-01-01T00:00:00.000Z",
//       "updatedAt": "2024-01-01T00:00:00.000Z"
//     },
//     {
//       "name": "Kenyan National Scale",
//       "letterGrade": "B",
//       "minScore": 65.0,
//       "maxScore": 69.99,
//       "gpa": 3.0,
//       "description": "Above average performance",
//       "schoolId": null,
//       "subjectId": null,
//       "examType": null,
//       "isDefault": true,
//       "createdAt": "2024-01-01T00:00:00.000Z",
//       "updatedAt": "2024-01-01T00:00:00.000Z"
//     },
//     {
//       "name": "Kenyan National Scale",
//       "letterGrade": "B-",
//       "minScore": 60.0,
//       "maxScore": 64.99,
//       "gpa": 2.7,
//       "description": "Satisfactory performance",
//       "schoolId": null,
//       "subjectId": null,
//       "examType": null,
//       "isDefault": true,
//       "createdAt": "2024-01-01T00:00:00.000Z",
//       "updatedAt": "2024-01-01T00:00:00.000Z"
//     },
//     {
//       "name": "Kenyan National Scale",
//       "letterGrade": "C+",
//       "minScore": 55.0,
//       "maxScore": 59.99,
//       "gpa": 2.3,
//       "description": "Average performance",
//       "schoolId": null,
//       "subjectId": null,
//       "examType": null,
//       "isDefault": true,
//       "createdAt": "2024-01-01T00:00:00.000Z",
//       "updatedAt": "2024-01-01T00:00:00.000Z"
//     },
//     {
//       "name": "Kenyan National Scale",
//       "letterGrade": "C",
//       "minScore": 50.0,
//       "maxScore": 54.99,
//       "gpa": 2.0,
//       "description": "Below average performance",
//       "schoolId": null,
//       "subjectId": null,
//       "examType": null,
//       "isDefault": true,
//       "createdAt": "2024-01-01T00:00:00.000Z",
//       "updatedAt": "2024-01-01T00:00:00.000Z"
//     },
//     {
//       "name": "Kenyan National Scale",
//       "letterGrade": "C-",
//       "minScore": 45.0,
//       "maxScore": 49.99,
//       "gpa": 1.7,
//       "description": "Slightly below average",
//       "schoolId": null,
//       "subjectId": null,
//       "examType": null,
//       "isDefault": true,
//       "createdAt": "2024-01-01T00:00:00.000Z",
//       "updatedAt": "2024-01-01T00:00:00.000Z"
//     },
//     {
//       "name": "Kenyan National Scale",
//       "letterGrade": "D+",
//       "minScore": 40.0,
//       "maxScore": 44.99,
//       "gpa": 1.3,
//       "description": "Needs improvement",
//       "schoolId": null,
//       "subjectId": null,
//       "examType": null,
//       "isDefault": true,
//       "createdAt": "2024-01-01T00:00:00.000Z",
//       "updatedAt": "2024-01-01T00:00:00.000Z"
//     },
//     {
//       "name": "Kenyan National Scale",
//       "letterGrade": "D",
//       "minScore": 35.0,
//       "maxScore": 39.99,
//       "gpa": 1.0,
//       "description": "Poor performance",
//       "schoolId": null,
//       "subjectId": null,
//       "examType": null,
//       "isDefault": true,
//       "createdAt": "2024-01-01T00:00:00.000Z",
//       "updatedAt": "2024-01-01T00:00:00.000Z"
//     },
//     {
//       "name": "Kenyan National Scale",
//       "letterGrade": "D-",
//       "minScore": 30.0,
//       "maxScore": 34.99,
//       "gpa": 0.7,
//       "description": "Very poor performance",
//       "schoolId": null,
//       "subjectId": null,
//       "examType": null,
//       "isDefault": true,
//       "createdAt": "2024-01-01T00:00:00.000Z",
//       "updatedAt": "2024-01-01T00:00:00.000Z"
//     },
//     {
//       "name": "Kenyan National Scale",
//       "letterGrade": "E",
//       "minScore": 0.0,
//       "maxScore": 29.99,
//       "gpa": 0.0,
//       "description": "Fail",
//       "schoolId": null,
//       "subjectId": null,
//       "examType": null,
//       "isDefault": true,
//       "createdAt": "2024-01-01T00:00:00.000Z",
//       "updatedAt": "2024-01-01T00:00:00.000Z"
//     }
//   ]
  

//   await insertData('GradeScale', gradscales);
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
