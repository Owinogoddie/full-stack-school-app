"use server";

import prisma from "@/lib/prisma";
import { FeeExceptionSchema } from "@/schemas/fee-exception-schema";
import { logFeeChange } from "@/lib/feeLogger";
import { auth } from "@clerk/nextjs/server";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
  data?: any;
};

const { userId } = auth();

export const createFeeException = async (
  data: FeeExceptionSchema
): Promise<ResponseState> => {
  try {
    if (!userId) {
      return { 
        success: false, 
        error: true, 
        message: "User not authenticated" 
      };
    }
    const template = await prisma.feeTemplate.findUnique({
      where: { id: data.feeTemplateId },
    });

    if (!template) {
      return { success: false, error: true, message: "Fee template not found" };
    }

    if (data.endDate && data.startDate > data.endDate) {
      return {
        success: false,
        error: true,
        message: "End date must be after start date",
      };
    }

    const existingException = await prisma.feeException.findFirst({
      where: {
        studentId: data.studentId,
        feeTemplateId: data.feeTemplateId,
        status: "ACTIVE",
        OR: [
          {
            startDate: { lte: data.endDate || new Date("2099-12-31") },
            endDate: { gte: data.startDate },
          },
          {
            startDate: { lte: data.startDate },
            endDate: null,
          },
        ],
      },
    });

    if (existingException) {
      return {
        success: false,
        error: true,
        message: "Overlapping exception exists",
      };
    }

    const exception = await prisma.feeException.create({
      data: {
        ...data,
        approvedBy: userId,
        status: "ACTIVE",
      },
    });

    // Log exception creation
    await logFeeChange({
      entityType: "FEE_EXCEPTION",
      entityId: exception.id,
      action: "CREATE",
      changes: {
        feeTemplateId: data.feeTemplateId,
        studentId: data.studentId,
        type: data.type,
        adjustmentType: data.adjustmentType,
        adjustmentValue: data.adjustmentValue,
        startDate: data.startDate,
        endDate: data.endDate,
        status: "ACTIVE",
      },
      performedBy: userId || "SYSTEM",
      feeAmountChange: {
        feeTemplateId: data.feeTemplateId,
        previousAmount: template.baseAmount,
        newAmount: calculateAdjustedAmount(
          template.baseAmount,
          data.adjustmentType,
          data.adjustmentValue
        ),
        reason: `Exception created: ${data.type}`,
      },
    });

    return {
      success: true,
      error: false,
      message: "Fee exception created successfully",
      data: exception,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: true,
      message: "Failed to create fee exception",
    };
  }
};

export const updateFeeException = async (
  updates: FeeExceptionSchema
): Promise<ResponseState> => {
  try {
    if (!userId) {
      return { 
        success: false, 
        error: true, 
        message: "User not authenticated" 
      };
    }
    const { id } = updates;
    if (!id) {
      throw new Error("ID is required for update");
    }

    const currentException = await prisma.feeException.findUnique({
      where: { id },
    });

    if (!currentException) {
      return {
        success: false,
        error: true,
        message: "Fee exception not found",
      };
    }

    const exception = await prisma.feeException.update({
      where: { id },

      data: { ...updates, approvedBy: userId },
    });

    // Log exception update
    await logFeeChange({
      entityType: "FEE_EXCEPTION",
      entityId: id,
      action: "UPDATE",
      changes: {
        old: currentException,
        new: exception,
      },
      performedBy: userId || "SYSTEM",
      feeAmountChange: {
        feeTemplateId: exception.feeTemplateId,
        previousAmount: calculateAdjustedAmount(
          currentException.adjustmentValue || 0,
          currentException.adjustmentType,
          currentException.adjustmentValue
        ),
        newAmount: calculateAdjustedAmount(
          updates.adjustmentValue,
          updates.adjustmentType,
          updates.adjustmentValue
        ),
        reason: `Exception updated: ${updates.type}`,
      },
    });

    return {
      success: true,
      error: false,
      message: "Fee exception updated successfully",
      data: exception,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: true,
      message: "Failed to update fee exception",
    };
  }
};

export const deleteFeeException = async (
  currentState: ResponseState,
  formData: FormData
): Promise<ResponseState> => {
  try {
    // Extract 'id' from formData
    const idValue = formData.get("id");

    // Ensure 'id' is not null and can be converted to a string
    if (!idValue || typeof idValue !== "string") {
      return {
        success: false,
        error: true,
        message: "Invalid fee exception ID",
      };
    }

    const currentException = await prisma.feeException.findUnique({
      where: { id: idValue },
    });

    if (!currentException) {
      return {
        success: false,
        error: true,
        message: "Fee exception not found",
      };
    }

    const exception = await prisma.feeException.update({
      where: { id: idValue },
      data: {
        status: "CANCELLED",
        endDate: new Date(),
      },
    });

    // Log exception deletion/cancellation
    await logFeeChange({
      entityType: "FEE_EXCEPTION",
      entityId: idValue,
      action: "DELETE",
      changes: {
        old: currentException,
        new: exception,
      },
      performedBy: "SYSTEM",
      feeAmountChange: {
        feeTemplateId: exception.feeTemplateId,
        previousAmount: calculateAdjustedAmount(
          currentException.adjustmentValue,
          currentException.adjustmentType,
          currentException.adjustmentValue
        ),
        newAmount: currentException.adjustmentValue, // Reverting to original amount
        reason: "Exception cancelled",
      },
    });

    return {
      success: true,
      error: false,
      message: "Fee exception deleted successfully",
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: true,
      message: "Failed to delete fee exception",
    };
  }
};

// Helper function to calculate adjusted amount
function calculateAdjustedAmount(
  baseAmount: number,
  adjustmentType: string,
  adjustmentValue: number
): number {
  if (adjustmentType === "PERCENTAGE") {
    return baseAmount * (1 - adjustmentValue / 100);
  }
  return baseAmount - adjustmentValue;
}
