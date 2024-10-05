// @/actions/data-fetching.ts
import prisma from '@/lib/prisma';

// Fetch all exams from the database
export async function getExams() {
  try {
    const exams = await prisma.exam.findMany();
    return exams;
  } catch (error) {
    console.error('Error fetching exams:', error);
    return [];
  }
}

// Fetch all academic years from the database
export async function getAcademicYears() {
  try {
    const academicYears = await prisma.academicYear.findMany();
    return academicYears;
  } catch (error) {
    console.error('Error fetching academic years:', error);
    return [];
  }
}

// Fetch all subjects from the database
export async function getSubjects() {
  try {
    const subjects = await prisma.subject.findMany();
    return subjects;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
}

// Fetch all classes from the database
export async function getClasses() {
  try {
    const classes = await prisma.class.findMany();
    return classes;
  } catch (error) {
    console.error('Error fetching classes:', error);
    return [];
  }
}

// Fetch all grade scales from the database
export async function getGradeScales() {
  try {
    const gradeScales = await prisma.gradeScale.findMany();
    return gradeScales;
  } catch (error) {
    console.error('Error fetching grade scales:', error);
    return [];
  }
}
