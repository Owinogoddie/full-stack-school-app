'use server'

import prisma from "@/lib/prisma";
import { FeeTemplateSchema } from "@/schemas/fee-template-schema";
import { logFeeChange } from "@/lib/feeLogger";
import { auth } from "@clerk/nextjs/server";
const { userId } = auth();

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

// Create FeeTemplate
export const createFeeTemplate = async (data: FeeTemplateSchema): Promise<ResponseState> => {
  try {
    const newTemplate = await prisma.feeTemplate.create({
      data: {
        classes: data.classes ? { connect: data.classes.map(id => ({ id: parseInt(id) })) } : undefined,
        grades: data.grades ? { connect: data.grades.map(id => ({ id: parseInt(id) })) } : undefined,
        academicYear: { connect: { id: data.academicYearId} },
        term: { connect: { id: data.termId } },
        feeType: { connect: { id: data.feeTypeId } },
        studentCategories: data.studentCategoryIds ? { connect: data.studentCategoryIds.map(id => ({ id })) } : undefined,
        baseAmount: data.baseAmount,
      },
    });

    // Log template creation
    await logFeeChange({
      entityType: 'FEE_TEMPLATE',
      entityId: newTemplate.id,
      action: 'CREATE',
      changes: {
        grades: data.grades,
        classes: data.classes,
        academicYearId: data.academicYearId,
        termId: data.termId,
        feeTypeId: data.feeTypeId,
        studentCategoryIds: data.studentCategoryIds,
        baseAmount: data.baseAmount
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
    return { success: false, error: true, message: "Failed to create fee template" };
  }
};

// Update FeeTemplate
export const updateFeeTemplate = async (data: FeeTemplateSchema): Promise<ResponseState> => {
  try {
    if (!data.id) {
      throw new Error("Fee Template ID is required for update");
    }

    // Get original template for comparison
    const originalTemplate = await prisma.feeTemplate.findUnique({
      where: { id: data.id },
      include: {
        grades: true,
        classes: true,
        studentCategories: true
      }
    });

    prisma.feeTemplate.update({
      where: { id: data.id },
      data: {
        grades: data.grades ? { connect: data.grades.map(id => ({ id: parseInt(id) })) } : undefined,
        classes: data.classes ? { set: data.classes.map(id => ({ id: parseInt(id) })) } : undefined,
        academicYear: { connect: { id:data.academicYearId } },
        term: { connect: { id: data.termId } },
        feeType: { connect: { id: data.feeTypeId } },
        studentCategories: data.studentCategoryIds ? { set: data.studentCategoryIds.map(id => ({ id })) } : undefined,
        baseAmount: data.baseAmount,
      },
    });

    // Log template update
    await logFeeChange({
      entityType: 'FEE_TEMPLATE',
      entityId: data.id,
      action: 'UPDATE',
      changes: {
        old: {
          grades: originalTemplate?.grades.map(g => g.id),
          classes: originalTemplate?.classes.map(c => c.id),
          baseAmount: originalTemplate?.baseAmount,
          studentCategoryIds: originalTemplate?.studentCategories.map(sc => sc.id)
        },
        new: {
          grades: data.grades,
          classes: data.classes,
          baseAmount: data.baseAmount,
          studentCategoryIds: data.studentCategoryIds
        }
      },
      performedBy: userId || 'SYSTEM',
      // Include fee amount change if amount was updated
      ...(originalTemplate?.baseAmount !== data.baseAmount && {
        feeAmountChange: {
          feeTemplateId: data.id,
          previousAmount: originalTemplate?.baseAmount,
          newAmount: data.baseAmount,
          reason:'Template amount update'
        }
      })
    });

    return { success: true, error: false, message: "Fee template updated successfully" };
  } catch (err) {
    console.error(err);
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

    const template = await prisma.feeTemplate.findUnique({
      where: { id: idValue },
    });

    if (!template) {
      return { success: false, error: true, message: "Fee template not found" };
    }

    await prisma.feeTemplate.delete({
      where: { id: idValue },
    });

    // Log template deletion
    await logFeeChange({
      entityType: 'FEE_TEMPLATE',
      entityId: idValue,
      action: 'DELETE',
      changes: {
        deletedTemplate: template,
      },
      performedBy: 'SYSTEM',
    });

    return { success: true, error: false, message: "Fee template deleted successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to delete fee template" };
  }
};
