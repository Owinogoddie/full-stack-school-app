"use server";

import prisma from "@/lib/prisma";
export interface FeeExemptionDetail {
  feeTypeName: string;
  amount: number;
  type: string;
  adjustmentType: string;
}
export interface FeeBreakdownItem {
  feeTypeId: string;
  feeTypeName: string;
  amount: number;
  paid: number;
  exemptions: FeeExemption[];
  balance: number;
}
export interface FeeExemption {
  type: string;
  amount: number;
  adjustmentType: string;
}
export interface StudentFeeSummary {
  studentId: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  totalExpected: number;
  totalExemptions: number;
  actualPaid: number;
  balance: number;
  creditBalance: number;
  feeBreakdown: FeeBreakdownItem[];
  extraFees: number;
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
        studentCreditBalances: true,
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
                    id: true,
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
        ...(feeTypeIds?.length && { feeTypeId: { in: feeTypeIds } }),
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

    return students.map((student) => {
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

      // Group templates by fee type
      const feeTypeGroups = applicableTemplates.reduce((acc, template) => {
        const feeTypeId = template.feeTypeId;
        if (!acc[feeTypeId]) {
          acc[feeTypeId] = {
            feeTypeId,
            feeTypeName: template.feeType.name,
            templates: [],
          };
        }
        acc[feeTypeId].templates.push(template);
        return acc;
      }, {} as Record<string, { feeTypeId: string; feeTypeName: string; templates: typeof applicableTemplates }>);

      // Calculate fee breakdown
      const feeBreakdown: FeeBreakdownItem[] = Object.values(feeTypeGroups).map(
        ({ feeTypeId, feeTypeName, templates }) => {
          // Calculate expected amount for this fee type
          const amount = templates.reduce(
            (sum, template) => sum + template.baseAmount,
            0
          );

          // Calculate exemptions for this fee type
          const exemptions: FeeExemption[] = student.feeExceptions
            .filter(
              (exception) => exception.feeTemplate.feeTypeId === feeTypeId
            )
            .map((exception) => {
              let exemptionAmount = 0;
              if (exception.adjustmentType === "PERCENTAGE") {
                exemptionAmount = amount * (exception.adjustmentValue / 100);
              } else {
                exemptionAmount = Math.min(exception.adjustmentValue, amount);
              }
              return {
                type: exception.type,
                amount: exemptionAmount,
                adjustmentType: exception.adjustmentType,
              };
            });

          // Calculate total paid for this fee type
          const paid = student.feeTransactions.reduce((sum, transaction) => {
            const relevantAllocations = transaction.allocations.filter(
              (allocation) =>
                templates.some(
                  (template) => template.id === allocation.feeTemplateId
                )
            );
            return (
              sum +
              relevantAllocations.reduce(
                (allocationSum, allocation) =>
                  allocationSum + allocation.amountAllocated,
                0
              )
            );
          }, 0);

          // Calculate total exemptions for this fee type
          const totalExemptions = exemptions.reduce(
            (sum, exemption) => sum + exemption.amount,
            0
          );

          // Calculate balance for this fee type
          const balance = amount - totalExemptions - paid;

          return {
            feeTypeId,
            feeTypeName,
            amount,
            paid,
            exemptions,
            balance,
          };
        }
      );

      // Calculate totals
      const totalExpected = feeBreakdown.reduce(
        (sum, item) => sum + item.amount,
        0
      );
      const totalExemptions = feeBreakdown.reduce(
        (sum, item) =>
          sum +
          item.exemptions.reduce(
            (exemptionSum, exemption) => exemptionSum + exemption.amount,
            0
          ),
        0
      );
      const actualPaid = feeBreakdown.reduce((sum, item) => sum + item.paid, 0);

      // Calculate final balance and credit
      const netBalance = totalExpected - totalExemptions - actualPaid;
      const balance = Math.max(0, netBalance);
      const creditBalance = Math.max(0, -netBalance);
      const extraFees = student.studentCreditBalances.reduce(
        (sum, balance) => sum + balance.amount,
        0
      );
      return {
        studentId: student.id,
        admissionNumber: student.admissionNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        totalExpected,
        totalExemptions,
        actualPaid,
        balance,
        creditBalance,
        feeBreakdown,
        extraFees,
      };
    });
  } catch (error) {
    console.error("Error in getStudentFeeSummary:", error);
    throw error;
  }
}
