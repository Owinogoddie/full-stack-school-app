// actions/feetemplate-actions.ts
'use server'

import prisma from "@/lib/prisma";
import { FeeTemplateSchema } from "@/schemas/fee-template-schema";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
};

export const createFeeTemplate = async (data: FeeTemplateSchema): Promise<ResponseState> => {
  try {
    await prisma.feeTemplate.create({
      data: {
        schoolId: data.schoolId,
        academicYearId: data.academicYearId,
        termId: data.termId,
        feeTypeId: data.feeTypeId,
        baseAmount: data.baseAmount,
        version: 1,
        isActive: true,
      }
    });

    return { success: true, error: false, message: "Fee template created successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to create fee template" };
  }
};

export const updateFeeTemplate = async (data: FeeTemplateSchema): Promise<ResponseState> => {
  try {
    if (!data.id) {
      throw new Error("Fee Template ID is required for update");
    }

    await prisma.feeTemplate.update({
      where: { id: data.id },
      data: {
        schoolId: data.schoolId,
        academicYearId: data.academicYearId,
        termId: data.termId,
        feeTypeId: data.feeTypeId,
        baseAmount: data.baseAmount,
        version: { increment: 1 },
        isActive: data.isActive
      }
    });

    return { success: true, error: false, message: "Fee template updated successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to update fee template" };
  }
};

export const deleteFeeTemplate = async (
  currentState: ResponseState,
  formData: FormData
): Promise<ResponseState> => {
  try {
    const id = formData.get("id");
    if (!id || typeof id !== "string") {
      return { success: false, error: true, message: "Invalid fee template ID" };
    }

    await prisma.feeTemplate.delete({
      where: { id }
    });

    return { success: true, error: false, message: "Fee template deleted successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to delete fee template" };
  }
};