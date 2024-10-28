'use server'

import prisma from '@/lib/prisma';
import type { UnpaidFeesResponse } from './types'
import type { Prisma } from '@prisma/client';

export async function getUnpaidFeesByGradeOrClass(
  params: {
    gradeId?: number;
    classId?: number;
    academicYearId: number;
    termId: string;
    schoolId: string;
  }
): Promise<UnpaidFeesResponse> {
  const { gradeId, classId, academicYearId, termId, schoolId } = params;

  if (!gradeId && !classId) {
    throw new Error('Either gradeId or classId must be provided');
  }

  // Get students based on grade or class
  const students = await prisma.student.findMany({
    where: {
      schoolId,
      ...(gradeId && { gradeId }),
      ...(classId && { classId }),
      status: 'ACTIVE'
    },
    include: {
      grade: true,
      class: true,
      studentCategories: true,
      specialProgrammes: true,
      excessFees: {
        where: {
          isUsed: false,
          OR: [
            {
              academicYearId,
              termId
            },
            {
              academicYearId,
              termId: ""
            }
          ]
        }
      }
    }
  });

  if (!students.length) {
    return [];
  }

  const studentIds = students.map(s => s.id);

  // Filter out null values and cast to number[] explicitly
const validClassIds = students
.map(s => s.classId)
.filter((id): id is number => id !== null);

const feeStructureWhere: Prisma.FeeStructureWhereInput = {
academicYearId,
termId,
isActive: true,
AND: [
  {
    OR: students.flatMap(student => 
      student.studentCategories.map(category => ({
        categories: {
          some: {
            id: category.id
          }
        }
      }))
    )
  },
  {
    OR: students.map(student => ({
      grades: {
        some: {
          id: student.gradeId
        }
      }
    }))
  },
  {
    OR: [
      {
        classes: {
          some: {
            id: {
              in: validClassIds // Use the filtered array here
            }
          }
        }
      },
      {
        classes: {
          none: {}
        }
      }
    ]
  }
]
};

  // Parallel fetch of all required data
  const [feeStructures, exceptions, feeStatuses] = await Promise.all([
    prisma.feeStructure.findMany({
      where: feeStructureWhere,
      include: {
        feeType: true,
        categories: true,
        grades: true,
        classes: true
      }
    }),

    prisma.feeException.findMany({
      where: {
        studentId: { in: studentIds },
        isActive: true,
        startDate: { lte: new Date() },
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } }
        ]
      }
    }),

    prisma.feeStatus.findMany({
      where: {
        studentId: { in: studentIds },
        academicYearId,
        termId
      }
    })
  ]);

  // Process each student's fees
  const result = students.map(student => {
    const studentFeeStructures = feeStructures.filter(fs => {
      const matchingCategory = student.studentCategories.some(
        category => fs.categories.some(c => c.id === category.id)
      );
      const matchingGrade = fs.grades.some(g => g.id === student.gradeId);
      const matchingClass = fs.classes.length === 0 || 
                          fs.classes.some(c => c.id === student.classId);
      
      return matchingCategory && matchingGrade && matchingClass;
    });

    const studentExceptions = exceptions.filter(e => e.studentId === student.id);
    const studentFeeStatuses = feeStatuses.filter(fs => fs.studentId === student.id);
    
    const totalExcessFees = student.excessFees.reduce((sum, excess) => sum + excess.amount, 0);

    let totalOriginalAmount = 0;
    let totalApplicableAmount = 0;
    let totalPaidAmount = 0;
    let totalRemainingAmount = 0;

    const unpaidFees = studentFeeStructures.map(structure => {
      const exception = studentExceptions.find(e => e.feeStructureId === structure.id);
      const feeStatus = studentFeeStatuses.find(fs => fs.feeStructureId === structure.id);
      
      const originalAmount = structure.amount;
      const applicableAmount = exception ? exception.amount : originalAmount;
      const paidAmount = feeStatus?.paidAmount || 0;
      const remainingAmount = applicableAmount - paidAmount;

      totalOriginalAmount += originalAmount;
      totalApplicableAmount += applicableAmount;
      totalPaidAmount += paidAmount;
      totalRemainingAmount += remainingAmount;

      return {
        feeStructureId: structure.id,
        feeType: structure.feeType.name,
        originalAmount,
        applicableAmount,
        paidAmount,
        remainingAmount,
        dueDate: structure.dueDate,
        isOverdue: structure.dueDate < new Date(),
        hasException: !!exception,
        exception: exception || null,
        status: feeStatus?.status || 'PENDING'
      };
    }).filter(fee => fee.remainingAmount > 0);

    const finalRemainingAmount = Math.max(0, totalRemainingAmount - totalExcessFees);

    return {
      student: {
        id: student.id,
        upi: student.upi,
        admissionNumber: student.admissionNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        grade: student.grade.levelName,
        class: student.class?.name,
        gender: student.gender,
        status: student.status,
        categories: student.studentCategories.map(c => c.name),
        specialProgrammes: student.specialProgrammes.map(p => p.name)
      },
      feeSummary: {
        totalOriginalAmount,
        totalApplicableAmount,
        totalPaidAmount,
        totalRemainingAmount,
        availableExcessFees: totalExcessFees,
        finalRemainingAmount
      },
      unpaidFees
    };
  });

  return result;
}