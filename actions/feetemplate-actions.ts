'use server'
import prisma from "@/lib/prisma";
import { FeeTemplateSchema } from "@/schemas/fee-template-schema";
import { logFeeChange } from "@/lib/feeLogger";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

// Helper function to validate related records
async function validateRelatedRecords(data: FeeTemplateSchema): Promise<ResponseState | null> {
  const academicYear = await prisma.academicYear.findUnique({ where: { id: data.academicYearId } });
  const term = await prisma.term.findUnique({ where: { id: data.termId } });
  const feeType = await prisma.feeType.findUnique({ where: { id: data.feeTypeId } });

  if (!academicYear || !term || !feeType) {
    return { success: false, error: true, message: "One or more related records not found" };
  }

  for (const gc of data.gradeClasses) {
    const grade = await prisma.grade.findUnique({ where: { id: Number(gc.gradeId) } });
    if (!grade) {
      return { success: false, error: true, message: `Grade with id ${gc.gradeId} not found` };
    }
    for (const classId of gc.classes) {
      const classRecord = await prisma.class.findUnique({ where: { id: Number(classId) } });
      if (!classRecord) {
        return { success: false, error: true, message: `Class with id ${classId} not found` };
      }
    }
  }

  return null; // All validations passed
}

// Create FeeTemplate
export const createFeeTemplate = async (data: FeeTemplateSchema): Promise<ResponseState> => {
  console.log({data})
  const { userId } = auth();
  try {
    const validationError = await validateRelatedRecords(data);
    if (validationError) return validationError;

    // Validate student categories
    let studentCategoriesConnect = undefined;
    if (data.studentCategoryIds && data.studentCategoryIds.length > 0) {
      const existingCategories = await prisma.studentCategory.findMany({
        where: { id: { in: data.studentCategoryIds } }
      });
      if (existingCategories.length !== data.studentCategoryIds.length) {
        return { success: false, error: true, message: "One or more Student Categories not found" };
      }
      studentCategoriesConnect = { connect: data.studentCategoryIds.map(id => ({ id })) };
    }

    // Validate special programme
    let specialProgrammeConnect = undefined;
    if (data.specialProgrammeId) {
      const specialProgramme = await prisma.specialProgramme.findUnique({
        where: { id: data.specialProgrammeId }
      });
      console.log({specialProgramme})
      if (!specialProgramme) {
        return { success: false, error: true, message: "Special Programme not found" };
      }
      specialProgrammeConnect = { connect: { id: data.specialProgrammeId } };
    }

    const newTemplate = await prisma.feeTemplate.create({
      data: {
        academicYear: { connect: { id: data.academicYearId } },
        term: { connect: { id: data.termId } },
        feeType: { connect: { id: data.feeTypeId } },
        studentCategories: studentCategoriesConnect,
        baseAmount: data.baseAmount,
        specialProgramme: specialProgrammeConnect,
        feeTemplateGradeClasses: {
          create: data.gradeClasses.flatMap(gc => 
            gc.classes.map(classId => ({
              grade: { connect: { id: Number(gc.gradeId) } },
              class: { connect: { id: Number(classId) } },
            }))
          ),
        },
      },
    });

    // Log template creation
    await logFeeChange({
      entityType: 'FEE_TEMPLATE',
      entityId: newTemplate.id,
      action: 'CREATE',
      changes: {
        gradeClasses: data.gradeClasses,
        academicYearId: data.academicYearId,
        termId: data.termId,
        feeTypeId: data.feeTypeId,
        studentCategoryIds: data.studentCategoryIds,
        baseAmount: data.baseAmount,
        specialProgrammeId: data.specialProgrammeId,
      },
      performedBy: userId || 'SYSTEM',
      feeAmountChange: {
        feeTemplateId: newTemplate.id,
        newAmount: data.baseAmount,
        reason: 'Initial template creation'
      }
    });

    return { success: true, error: false, message: "Fee template created successfully" };
  } catch (err) {
    console.error(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return { success: false, error: true, message: "A unique constraint failed. This could be due to duplicate grade-class combinations." };
      }
    }
    return { success: false, error: true, message: "Failed to create fee template" };
  }
};

// Update FeeTemplate
export const updateFeeTemplate = async (data: FeeTemplateSchema): Promise<ResponseState> => {
  const { userId } = auth();
  try {
    if (!data.id) {
      throw new Error("Fee Template ID is required for update");
    }

    const validationError = await validateRelatedRecords(data);
    if (validationError) return validationError;

    // Validate student categories
    let studentCategoriesConnect = undefined;
    if (data.studentCategoryIds && data.studentCategoryIds.length > 0) {
      const existingCategories = await prisma.studentCategory.findMany({
        where: { id: { in: data.studentCategoryIds } }
      });
      if (existingCategories.length !== data.studentCategoryIds.length) {
        return { success: false, error: true, message: "One or more Student Categories not found" };
      }
      studentCategoriesConnect = { set: data.studentCategoryIds.map(id => ({ id })) };
    }

    // Validate special programme
    let specialProgrammeConnect = undefined;
    if (data.specialProgrammeId) {
      const specialProgramme = await prisma.specialProgramme.findUnique({
        where: { id: data.specialProgrammeId }
      });
      if (!specialProgramme) {
        return { success: false, error: true, message: "Special Programme not found" };
      }
      specialProgrammeConnect = { connect: { id: data.specialProgrammeId } };
    }

    // Get original template for comparison
    const originalTemplate = await prisma.feeTemplate.findUnique({
      where: { id: data.id },
      include: {
        studentCategories: true,
        specialProgramme: true,
        feeTemplateGradeClasses: true,
      }
    });

    if (!originalTemplate) {
      return { success: false, error: true, message: "Fee template not found" };
    }

    await prisma.feeTemplate.update({
      where: { id: data.id },
      data: {
        academicYear: { connect: { id: data.academicYearId } },
        term: { connect: { id: data.termId } },
        feeType: { connect: { id: data.feeTypeId } },
        studentCategories: studentCategoriesConnect,
        baseAmount: data.baseAmount,
        specialProgramme: data.specialProgrammeId 
          ? specialProgrammeConnect 
          : { disconnect: true },
        feeTemplateGradeClasses: {
          deleteMany: {}, // Delete all existing entries
          create: data.gradeClasses.flatMap(gc => 
            gc.classes.map(classId => ({
              grade: { connect: { id: Number(gc.gradeId) } },
              class: { connect: { id: Number(classId) } },
            }))
          ),
        },
      },
    });

    // Log template update
    await logFeeChange({
      entityType: 'FEE_TEMPLATE',
      entityId: data.id,
      action: 'UPDATE',
      changes: {
        old: {
          gradeClasses: originalTemplate.feeTemplateGradeClasses,
          baseAmount: originalTemplate.baseAmount,
          studentCategoryIds: originalTemplate.studentCategories.map(sc => sc.id),
          specialProgrammeId: originalTemplate.specialProgramme?.id,
        },
        new: {
          gradeClasses: data.gradeClasses,
          baseAmount: data.baseAmount,
          studentCategoryIds: data.studentCategoryIds,
          specialProgrammeId: data.specialProgrammeId,
        }
      },
      performedBy: userId || 'SYSTEM',
      ...(originalTemplate.baseAmount !== data.baseAmount && {
        feeAmountChange: {
          feeTemplateId: data.id,
          previousAmount: originalTemplate.baseAmount,
          newAmount: data.baseAmount,
          reason: 'Template amount update'
        }
      })
    });

    return { success: true, error: false, message: "Fee template updated successfully" };
  } catch (err) {
    console.error(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return { success: false, error: true, message: "A unique constraint failed. This could be due to duplicate grade-class combinations." };
      }
    }
    return { success: false, error: true, message: "Failed to update fee template" };
  }
};
// Delete FeeTemplate
export const deleteFeeTemplate = async (
  currentState: ResponseState,
  formData: FormData
): Promise<ResponseState> => {
  try {
    // Extract 'id' from formData
    const idValue = formData.get("id");

    // Ensure 'id' is not null and can be converted to a string
    if (!idValue || typeof idValue !== "string") {
      return { success: false, error: true, message: "Invalid fee template ID" };
    }

    // Use a transaction to ensure all operations succeed or fail together
    await prisma.$transaction(async (prismaTransaction) => {
      // Find the template to be deleted
      const template = await prismaTransaction.feeTemplate.findUnique({
        where: { id: idValue },
        include: {
          feeTemplateGradeClasses: true,
          exceptions: true,
          feeTransactions: true,
          feeHistories: true,
          feeAllocations: true,
          studentCategories: true,
        },
      });

      if (!template) {
        throw new Error("Fee template not found");
      }

      // Delete related FeeTemplateGradeClass records
      await prismaTransaction.feeTemplateGradeClass.deleteMany({
        where: { feeTemplateId: idValue },
      });

      // Delete related FeeException records
      // await prismaTransaction.feeException.deleteMany({
      //   where: { feeTemplateId: idValue },
      // });

      // Delete related FeeTransaction records
      await prismaTransaction.feeTransaction.deleteMany({
        where: { feeTemplateId: idValue },
      });

      // Delete related FeeHistory records
      await prismaTransaction.feeHistory.deleteMany({
        where: { feeTemplateId: idValue },
      });

      // Delete related FeeAllocation records
      await prismaTransaction.feeAllocation.deleteMany({
        where: { feeTemplateId: idValue },
      });

      // Remove associations with StudentCategory
      await prismaTransaction.feeTemplate.update({
        where: { id: idValue },
        data: {
          studentCategories: {
            set: [],
          },
        },
      });

      // Finally, delete the FeeTemplate itself
      await prismaTransaction.feeTemplate.delete({
        where: { id: idValue },
      });

      // Log template deletion
      // await prismaTransaction.feeChangeLog.create({
      //   data: {
      //     entityType: 'FEE_TEMPLATE',
      //     entityId: idValue,
      //     action: 'DELETE',
      //     changes: {
      //       deletedTemplate: template,
      //     },
      //     performedBy: 'SYSTEM',
      //   },
      // });

      return template;
    });

    return { 
      success: true, 
      error: false, 
      message: "Fee template and all related records deleted successfully" 
    };

  } catch (err) {
    console.error(err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Failed to delete fee template" 
    };
  }
};