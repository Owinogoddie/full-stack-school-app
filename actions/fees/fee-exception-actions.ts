// actions/fee-exception-actions.ts
"use server";

import prisma from "@/lib/prisma";
import { logFeeChange } from "@/lib/feeLogger";
import { auth } from "@clerk/nextjs/server";
import { FeeExceptionSchema } from "@/schemas/fee-exception-schema";
import { AmountType } from "@prisma/client";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
  data?: any;
};

export const createFeeException = async (
  data: FeeExceptionSchema
): Promise<ResponseState> => {
  try {
    const { userId } = auth();
    if (!userId) {
      return { 
        success: false, 
        error: true, 
        message: "User not authenticated" 
      };
    }

    // Get feeTemplate and its associated feeType
    const feeTemplate = await prisma.feeTemplate.findUnique({
      where: { id: data.feeTemplateId },
      include: { feeType: true }
    });

    if (!feeTemplate) {
      return { 
        success: false, 
        error: true, 
        message: "Fee template not found" 
      };
    }

    if (data.endDate && data.startDate > data.endDate) {
      return {
        success: false,
        error: true,
        message: "End date must be after start date",
      };
    }

    // Check for overlapping exceptions
    const existingException = await prisma.feeException.findFirst({
      where: {
        studentId: data.studentId,
        feeTemplateId: data.feeTemplateId,
        status: "ACTIVE",
        OR: [
          {
            startDate: { lte: data.endDate || new Date("8099-12-31") },
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

    // Create exception with feeTypeId from template
    const exception = await prisma.feeException.create({
      data: {
        studentId: data.studentId,
        feeTemplateId: data.feeTemplateId,
        feeTypeId: feeTemplate.feeTypeId, // Get feeTypeId from template
        exceptionType: data.exceptionType,
        amountType: data.amountType as AmountType,
        amount: data.amountType === 'FIXED' ? data.amount : null,
        percentage: data.amountType === 'PERCENTAGE' ? data.percentage : null,
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.description,
        reason: data.reason,
        approvedBy: userId,
        status: "ACTIVE",
      },
      include: {
        feeTemplate: true,
        feeType: true,
      }
    });

    await logFeeChange({
      entityType: "FEE_EXCEPTION",
      entityId: exception.id,
      action: "CREATE",
      changes: {
        feeTemplateId: data.feeTemplateId,
        feeTypeId: feeTemplate.feeTypeId,
        studentId: data.studentId,
        exceptionType: data.exceptionType,
        amountType: data.amountType,
        amount: data.amount,
        percentage: data.percentage,
        startDate: data.startDate,
        endDate: data.endDate,
        status: "ACTIVE",
      },
      performedBy: userId,
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
  data: FeeExceptionSchema
): Promise<ResponseState> => {
  try {
    const { userId } = auth();
    if (!userId) {
      return { 
        success: false, 
        error: true, 
        message: "User not authenticated" 
      };
    }

    const { id } = data;
    if (!id) {
      throw new Error("ID is required for update");
    }

    // Get feeTemplate and its associated feeType
    const feeTemplate = await prisma.feeTemplate.findUnique({
      where: { id: data.feeTemplateId },
      include: { feeType: true }
    });

    if (!feeTemplate) {
      return { 
        success: false, 
        error: true, 
        message: "Fee template not found" 
      };
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
      data: {
        studentId: data.studentId,
        feeTemplateId: data.feeTemplateId,
        feeTypeId: feeTemplate.feeTypeId,
        exceptionType: data.exceptionType,
        amountType: data.amountType as AmountType,
        amount: data.amountType === 'FIXED' ? data.amount : null,
        percentage: data.amountType === 'PERCENTAGE' ? data.percentage : null,
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.description,
        reason: data.reason,
        approvedBy: userId,
        status: data.status,
      },
      include: {
        feeTemplate: true,
        feeType: true,
      }
    });

    await logFeeChange({
      entityType: "FEE_EXCEPTION",
      entityId: id,
      action: "UPDATE",
      changes: {
        old: currentException,
        new: exception,
      },
      performedBy: userId,
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