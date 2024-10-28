'use server'
import prisma from "@/lib/prisma";
export interface AcademicYear {
    id: number;
    year: string;
  }
  
  export interface Term {
    id: string;
    name: string;
    academicYearId: number;
  }
  
  export interface Grade {
    id: number;
    levelName: string;
  }
  
  export async function getAcademicYears(): Promise<AcademicYear[]> {
    return await prisma.academicYear.findMany({
      orderBy: { year: 'desc' },
      select: { id: true, year: true }
    });
  }
  
  export async function getTermsByAcademicYear(academicYearId: number): Promise<Term[]> {
    return await prisma.term.findMany({
      where: { academicYearId },
      select: { id: true, name: true, academicYearId: true }
    });
  }
  
  export async function getGrades(): Promise<Grade[]> {
    return await prisma.grade.findMany({
      select: { id: true, levelName: true }
    });
  }