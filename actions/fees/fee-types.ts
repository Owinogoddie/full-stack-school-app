// app/actions/fee-types.ts
'use server'

import prisma from "@/lib/prisma";
import { FeeTypeSchema } from "@/schemas/fee-type-schema";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

export const createFeeType = async (data: FeeTypeSchema): Promise<ResponseState> => {
  try {
    await prisma.feeType.create({
      data: {
        name: data.name,
        description: data.description || null,
        amount: data.amount || null,
        schoolId: data.schoolId || null,
      },
    });

    return { 
      success: true, 
      error: false, 
      message: "Fee type created successfully" 
    };
  } catch (err) {
    console.error(err);
    return { 
      success: false, 
      error: true, 
      message: "Failed to create fee type" 
    };
  }
};

export const updateFeeType = async (data: FeeTypeSchema): Promise<ResponseState> => {
  try {
    if (!data.id) {
      throw new Error("Fee Type ID is required for update");
    }

    await prisma.feeType.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description || null,
        amount: data.amount || null,
        schoolId: data.schoolId || null,
      },
    });

    return { 
      success: true, 
      error: false, 
      message: "Fee type updated successfully" 
    };
  } catch (err) {
    console.error(err);
    return { 
      success: false, 
      error: true, 
      message: "Failed to update fee type" 
    };
  }
};

export const deleteFeeType = async (
  currentState: ResponseState,
  formData: FormData
): Promise<ResponseState> => {
  try {
    const id = formData.get("id");

    if (!id || typeof id !== "string") {
      return { 
        success: false, 
        error: true, 
        message: "Invalid fee type ID" 
      };
    }

    // Check if the fee type has any associated templates
    const feeType = await prisma.feeType.findUnique({
      where: { id },
      include: { feeTemplates: true }
    });

    if (!feeType) {
      return { 
        success: false, 
        error: true, 
        message: "Fee type not found" 
      };
    }

    if (feeType.feeTemplates.length > 0) {
      return { 
        success: false, 
        error: true, 
        message: "Cannot delete fee type with existing templates" 
      };
    }

    await prisma.feeType.delete({
      where: { id },
    });

    return { 
      success: true, 
      error: false, 
      message: "Fee type deleted successfully" 
    };
  } catch (err) {
    console.error(err);
    return { 
      success: false, 
      error: true, 
      message: "Failed to delete fee type" 
    };
  }
};

// Additional utility function to get fee type by ID
export const getFeeTypeById = async (id: string) => {
  try {
    const feeType = await prisma.feeType.findUnique({
      where: { id },
      include: {
        school: true,
        feeTemplates: {
          include: {
            academicYear: true,
            term: true,
            exceptions: true,
          }
        }
      }
    });

    return feeType;
  } catch (err) {
    console.error(err);
    return null;
  }
};