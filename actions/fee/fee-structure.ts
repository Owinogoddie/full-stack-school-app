'use server'
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// interface GradeClass {
//   gradeId: number;
//   gradeName: string;
//   classes: {
//     id: number;
//     name: string;
//   }[];
// }

// interface FeeStructure {
//   id: string;
//   feeType: {
//     name: string;
//     description?: string;
//   };
//   baseAmount: number;
//   gradeClasses: GradeClass[];
//   studentCategories: string[];
//   term: string;
//   specialProgramme: string | null;
//   effectiveDate: Date;
//   version: number;
// }

// Function to get academic years
export async function getAcademicYears() {
  try {
    return await prisma.academicYear.findMany({
      orderBy: {
        startDate: 'desc'
      },
      select: {
        id: true,
        year: true
      }
    });
  } catch (error) {
    console.error('Error fetching academic years:', error);
    throw new Error('Failed to fetch academic years');
  }
}

// Function to get terms
export async function getTerms() {
  try {
    return await prisma.term.findMany({
      orderBy: {
        startDate: 'asc'
      },
      select: {
        id: true,
        name: true
      }
    });
  } catch (error) {
    console.error('Error fetching terms:', error);
    throw new Error('Failed to fetch terms');
  }
}

// Function to get grades
export async function getGrades() {
  try {
    return await prisma.grade.findMany({
      orderBy: {
        levelName: 'asc'
      },
      select: {
        id: true,
        levelName: true
      }
    });
  } catch (error) {
    console.error('Error fetching grades:', error);
    throw new Error('Failed to fetch grades');
  }
}

// Function to get classes
export async function getClasses() {
  try {
    return await prisma.class.findMany({
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
        gradeId: true
      }
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    throw new Error('Failed to fetch classes');
  }
}

// Function to get student categories
export async function getStudentCategories() {
  try {
    return await prisma.studentCategory.findMany({
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true
      }
    });
  } catch (error) {
    console.error('Error fetching student categories:', error);
    throw new Error('Failed to fetch student categories');
  }
}

// Function to get special programmes
export async function getSpecialProgrammes() {
  try {
    return await prisma.specialProgramme.findMany({
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
        description: true
      }
    });
  } catch (error) {
    console.error('Error fetching special programmes:', error);
    throw new Error('Failed to fetch special programmes');
  }
}

export async function getFeeStructure(params: {
  academicYearId: number;
  termId?: string;
  gradeId?: number;
  classId?: number;
  studentCategoryId?: string;
  specialProgrammeId?: string;
}) {
  try {
    const { academicYearId, termId, gradeId, classId, studentCategoryId, specialProgrammeId } = params;
    const whereClause: Prisma.FeeTemplateWhereInput = {
      academicYearId,
      isActive: true,
    };

    if (termId) {
      whereClause.termId = termId;
    }

    // Handling gradeId and classId using FeeTemplateGradeClass relation
    if (gradeId && classId) {
      whereClause.feeTemplateGradeClasses = {
        some: {
          gradeId: gradeId,
          classId: classId,
        },
      };
    } else if (gradeId) {
      whereClause.feeTemplateGradeClasses = {
        some: {
          gradeId: gradeId,
        },
      };
    } else if (classId) {
      whereClause.feeTemplateGradeClasses = {
        some: {
          classId: classId,
        },
      };
    }

    if (studentCategoryId) {
      whereClause.studentCategories = {
        some: {
          id: studentCategoryId,
        },
      };
    }

    if (specialProgrammeId) {
      whereClause.specialProgrammeId = specialProgrammeId;
    }

    // Add debug logging
    console.log('Query where clause:', JSON.stringify(whereClause, null, 2));

    // Get the filtered fee templates
    const feeTemplates = await prisma.feeTemplate.findMany({
      where: whereClause,
      select: {
        id: true,
        baseAmount: true,
        createdAt: true,
        version: true,
        feeTemplateGradeClasses: {
          select: {
            grade: {
              select: {
                id: true,
                levelName: true,
              },
            },
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        feeType: {
          select: {
            name: true,
            description: true,
          },
        },
        term: {
          select: {
            name: true,
          },
        },
        studentCategories: {
          select: {
            name: true,
          },
        },
        specialProgramme: {
          select: {
            name: true,
          },
        },
        exceptions: {
          where: {
            status: 'ACTIVE',
          },
          select: {
            type: true,
            adjustmentType: true,
            adjustmentValue: true,
            student: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    console.log('Filtered fee templates:', feeTemplates);

    // Transform the data to the required FeeStructure format
    return feeTemplates.map((template) => ({
      id: template.id,
      feeType: {
        name: template.feeType.name,
        description: template.feeType.description || undefined,
      },
      baseAmount: template.baseAmount,
      gradeClasses: template.feeTemplateGradeClasses.map(gc => ({
        gradeId: gc.grade.id,
        gradeName: gc.grade.levelName,
        classes: [
          {
            id: gc.class.id,
            name: gc.class.name,
          },
        ],
      })),
      studentCategories: template.studentCategories.map(sc => sc.name),
      term: template.term.name,
      specialProgramme: template.specialProgramme?.name || null,
      effectiveDate: template.createdAt,
      version: template.version,
    }));

  } catch (error) {
    console.error('Error fetching fee structure:', error);
    throw new Error('Failed to fetch fee structure');
  }
}

// Function to create fee audit log
export async function createFeeAuditLog(data: {
  entityType: string;
  entityId: string;
  action: string;
  changes: any;
  performedBy: string;
  metadata?: any;
}) {
  try {
    return await prisma.feeAuditLog.create({
      data: {
        ...data,
        changes: JSON.stringify(data.changes),
        metadata: data.metadata ? JSON.stringify(data.metadata) : null
      }
    });
  } catch (error) {
    console.error('Error creating fee audit log:', error);
    throw new Error('Failed to create fee audit log');
  }
}
