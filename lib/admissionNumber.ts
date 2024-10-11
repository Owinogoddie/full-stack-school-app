// utils/generateAdmissionNumber.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generates a unique admission number in the format ADMYYXXXX,
 * where YY is the last two digits of the current year and XXXX is a zero-padded number.
 */
export async function generateAdmissionNumber(): Promise<string> {
  const currentYear = new Date().getFullYear().toString().slice(-2); // e.g., '24' for 2024
  const prefix = `ADM${currentYear}`; // e.g., 'ADM24'

  // Find the latest student with the current year's prefix
  const lastStudent = await prisma.student.findFirst({
    where: {
      admissionNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      admissionNumber: 'desc',
    },
    select: {
      admissionNumber: true,
    },
  });

  let nextNumber = 1;
  
  if (lastStudent && lastStudent.admissionNumber) {
    // Extract the numeric part from the admission number
    const numericPart = lastStudent.admissionNumber.slice(-4);
    const lastNumber = parseInt(numericPart, 10);
    
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  const paddedNumber = nextNumber.toString().padStart(4, '0'); // e.g., '0001'
  return `${prefix}${paddedNumber}`; // e.g., 'ADM240001'
}
