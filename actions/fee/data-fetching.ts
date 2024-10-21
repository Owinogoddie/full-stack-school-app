'use server'
import prisma from "@/lib/prisma";

export async function getAcademicYears() {
    return await prisma.academicYear.findMany();
}

export async function getTerms(selectedAcademicYearId?: number) {
    try {
      const terms = await prisma.term.findMany({
        where: selectedAcademicYearId 
          ? { academicYearId: Number(selectedAcademicYearId) } 
          : {},
        select: {
          id: true,
          name: true,
          academicYearId: true,
        },
        orderBy: {
          name: 'asc'
        }
      });
  
      return terms.map(term => ({
        id: term.id,
        name: term.name,
        academicYearId: term.academicYearId
      }));
    } catch (error) {
      console.error('Error fetching terms:', error);
      throw new Error('Failed to fetch terms');
    }
  }

export async function getGrades() {
    return await prisma.grade.findMany();
}

export async function getClasses(selectedGradeId?: number) {
    // If an ID is provided, filter by that ID; otherwise, return all classes
    return await prisma.class.findMany({
        where: selectedGradeId ? { gradeId: Number(selectedGradeId) } : {},
    });
}

export async function getFeeTypes() {
    return await prisma.feeType.findMany();
}
