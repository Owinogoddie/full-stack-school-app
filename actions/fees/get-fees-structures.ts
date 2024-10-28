"use server";

import prisma from "@/lib/prisma";

export type FeeStructureFilters = {
  academicYearId?: number;
  termId?: string;
  gradeId?: number;
  classId?: number;
  studentAdmissionNumber?: string;
  studentCategoryIds?: string[];
  specialProgrammeIds?: string[];
};

export type FeeStructureWithRelations = {
  id: string;
  feeType: {
    id: string;
    name: string;
    amount: number | null;
  };
  amount: number;
  frequency: string | null;
  dueDate: Date;
  isActive: boolean;
  academicYear: {
    id: number;
    year: string;
  };
  term?: {
    id: string;
    name: string;
  } | null;
  categories: {
    id: string;
    name: string;
  }[];
  grades: {
    id: number;
    levelName: string;
  }[];
  classes: {
    id: number;
    name: string;
  }[];
  specialProgrammes: {
    id: string;
    name: string;
  }[];
};

export async function getFeeStructures(params?: {
  academicYearId?: number;
  termId?: string;
  gradeIds?: number[];
  classIds?: number[];
  studentCategoryIds?: string[];
  specialProgrammeIds?: string[];
  studentAdmissionNumber?: string;
}) {
  try {
    const { 
      academicYearId, 
      termId, 
      gradeIds, 
      classIds, 
      studentCategoryIds, 
      specialProgrammeIds,
      studentAdmissionNumber 
    } = params || {};

    // Debug log to see what parameters are being received
    console.log('Received params:', {
      academicYearId,
      termId,
      gradeIds,
      classIds,
      studentCategoryIds,
      specialProgrammeIds,
      studentAdmissionNumber
    });

    const whereConditions: any = {
      isActive: true,
      AND: [] // Initialize AND array
    };

    // Add each condition and log it
    if (academicYearId) {
      whereConditions.AND.push({ academicYearId });
      // console.log('Added academicYear condition');
    }

    if (termId) {
      whereConditions.AND.push({ termId });
      // console.log('Added term condition');
    }

    if (gradeIds && gradeIds.length > 0) {
      whereConditions.AND.push({
        grades: {
          some: { id: { in: gradeIds } }
        }
      });
      // console.log('Added grades condition:', gradeIds);
    }

    if (specialProgrammeIds && specialProgrammeIds.length > 0) {
      whereConditions.AND.push({
        specialProgrammes: {
          some: { id: { in: specialProgrammeIds } }
        }
      });
      // console.log('Added special programmes condition:', specialProgrammeIds);
    }
    if (studentCategoryIds && studentCategoryIds.length > 0) {
      whereConditions.AND.push({
        categories: {
          some: { id: { in: studentCategoryIds } }
        }
      });
      // console.log('Added categories condition:', studentCategoryIds);
    }
    // Clean up empty AND array
    if (whereConditions.AND.length === 0) {
      delete whereConditions.AND;
    }

    // console.log('Final where conditions:', JSON.stringify(whereConditions, null, 2));

    const feeStructures = await prisma.feeStructure.findMany({
      where: whereConditions,
      include: {
        feeType: {
          select: {
            id: true,
            name: true,
            amount: true,
          }
        },
        academicYear: {
          select: {
            id: true,
            year: true,
          }
        },
        term: {
          select: {
            id: true,
            name: true,
          }
        },
        categories: {
          select: {
            id: true,
            name: true,
          }
        },
        grades: {
          select: {
            id: true,
            levelName: true,
          }
        },
        classes: {
          select: {
            id: true,
            name: true,
          }
        },
        specialProgrammes: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      feeStructures,
      error: null
    };

  } catch (error) {
    // console.error('Error fetching fee structures:', error);
    return {
      feeStructures: null,
      error: error instanceof Error ? error.message : 'Failed to fetch fee structures'
    };
  }
}