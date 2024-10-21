"use server";

import prisma from "@/lib/prisma";

export interface StudentFeeSummary {
  studentId: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  totalExpected: number;
  totalExemptions: number;
  totalPaid: number;
  balance: number;
}

export async function getStudentFeeSummary({
  academicYearId,
  termId,
  gradeId,
  classId,
  feeTypeIds,
}: {
  academicYearId: number;
  termId: string;
  gradeId?: number;
  classId?: number;
  feeTypeIds?: string[];
}): Promise<StudentFeeSummary[]> {
  try {
    const students = await prisma.student.findMany({
      where: {
        status: "ACTIVE",
        ...(gradeId && { gradeId: Number(gradeId) }),
        ...(classId && { classId: Number(classId) }),
      },
      select: {
        id: true,
        admissionNumber: true,
        firstName: true,
        lastName: true,
        gradeId: true,
        classId: true,
        studentCategories: true,
        specialProgrammes: true,
        feeTransactions: {
          where: {
            academicYearId,
            termId,
          },
          select: {
            amount: true,
            allocations: {
              select: {
                amountAllocated: true,
                feeTemplateId: true,
              },
            },
          },
        },
        feeExceptions: {
          where: {
            feeTemplate: {
              academicYearId,
              termId,
            },
            status: "ACTIVE",
            startDate: { lte: new Date() },
            OR: [{ endDate: { gte: new Date() } }, { endDate: null }],
          },
          select: {
            feeTemplateId: true,
            type: true,
            adjustmentType: true,
            adjustmentValue: true,
            feeTemplate: {
              select: {
                feeTypeId: true,
                feeType: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const feeTemplates = await prisma.feeTemplate.findMany({
      where: {
        academicYearId,
        termId,
        isActive: true,
        ...(feeTypeIds &&
          feeTypeIds.length > 0 && {
            feeTypeId: { in: feeTypeIds },
          }),
      },
      include: {
        feeTemplateGradeClasses: {
          include: {
            grade: true,
            class: true,
          },
        },
        studentCategories: true,
        feeType: true,
        specialProgramme: true,
      },
    });

    const summaries: StudentFeeSummary[] = students.map((student) => {
      const applicableTemplates = feeTemplates.filter(
        (template) =>
          template.feeTemplateGradeClasses.some(
            (gradeClass) =>
              (gradeClass.gradeId === student.gradeId ||
                template.feeTemplateGradeClasses.length === 0) &&
              (gradeClass.classId === student.classId ||
                template.feeTemplateGradeClasses.length === 0)
          ) &&
          (template.studentCategories.some((category) =>
            student.studentCategories.some((sc) => sc.id === category.id)
          ) ||
            template.studentCategories.length === 0) &&
          (template.specialProgrammeId === null ||
            student.specialProgrammes.some(
              (sp) => sp.id === template.specialProgrammeId
            ))
      );

      let totalExpected = 0;
      let totalExemptions = 0;
      let totalPaid = 0;

      // Create an object to track fee type totals
      const feeTypeTotals: { [key: string]: number } = {};

      // Calculate total expected amount and aggregate by fee type
      applicableTemplates.forEach((template) => {
        const templateAmount = template.baseAmount;
        totalExpected += templateAmount;

        // Aggregate amounts by fee type
        if (!feeTypeTotals[template.feeTypeId]) {
          feeTypeTotals[template.feeTypeId] = 0;
        }
        feeTypeTotals[template.feeTypeId] += templateAmount;
      });

      // Process exceptions once per fee type
      const processedFeeTypes = new Set();

      // Group exceptions by fee type
      const exceptionsByFeeType: { [key: string]: any[] } = {};
      student.feeExceptions.forEach((exception) => {
        const feeTypeId = exception.feeTemplate.feeTypeId;
        if (!exceptionsByFeeType[feeTypeId]) {
          exceptionsByFeeType[feeTypeId] = [];
        }
        exceptionsByFeeType[feeTypeId].push(exception);
      });

      // Process exceptions for each fee type
      Object.entries(feeTypeTotals).forEach(([feeTypeId, totalAmount]) => {
        if (!processedFeeTypes.has(feeTypeId)) {
          const exceptions = exceptionsByFeeType[feeTypeId] || [];

          exceptions.forEach((exception) => {
            let exemptionAmount = 0;

            if (exception.adjustmentType === "PERCENTAGE") {
              exemptionAmount = totalAmount * (exception.adjustmentValue / 100);
            } else if (exception.adjustmentType === "FIXED_AMOUNT") {
              exemptionAmount = Math.min(
                exception.adjustmentValue,
                totalAmount
              );
            }

            switch (exception.type) {
              case "DISCOUNT":
              case "WAIVER":
              case "SCHOLARSHIP":
                totalExemptions += exemptionAmount;
                break;
              default:
                console.warn(`Unknown exception type: ${exception.type}`);
            }
          });

          processedFeeTypes.add(feeTypeId);
        }
      });

      // Calculate total paid amount
      applicableTemplates.forEach((template) => {
        const templatePayments = student.feeTransactions.reduce(
          (sum, transaction) => {
            const allocation = transaction.allocations.find(
              (a) => a.feeTemplateId === template.id
            );
            return sum + (allocation ? allocation.amountAllocated : 0);
          },
          0
        );

        totalPaid += templatePayments;
      });

      const balance = totalExpected - totalExemptions - totalPaid;

      // Debug final calculations
      // console.log("Final calculations:", {
      //   student: `${student.firstName} ${student.lastName}`,
      //   totalExpected,
      //   totalExemptions,
      //   totalPaid,
      //   balance,
      // });

      return {
        studentId: student.id,
        admissionNumber: student.admissionNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        totalExpected,
        totalExemptions,
        totalPaid,
        balance,
      };
    });

    return summaries;
  } catch (error) {
    console.error("Error in getStudentFeeSummary:", error);
    throw error;
  }
}
