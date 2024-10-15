'use server'

import prisma from "@/lib/prisma";
import { FeeTypeSchema } from "@/schemas/fee-type-schema";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

// Create FeeType
export const createFeeType = async (data: FeeTypeSchema): Promise<ResponseState> => {
  try {
    await prisma.feeType.create({
      data: {
        name: data.name,
        description: data.description,
        amount: data.amount,
      },
    });
    return { success: true, error: false, message: "Fee type created successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to create fee type" };
  }
};

// Update FeeType
export const updateFeeType = async (data: FeeTypeSchema): Promise<ResponseState> => {
  try {
    if (!data.id) {
      throw new Error("Fee Type ID is required for update");
    }

    await prisma.feeType.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        amount: data.amount,
      },
    });
    return { success: true, error: false, message: "Fee type updated successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to update fee type" };
  }
};

type CurrentState = { success: boolean; error: boolean };

export const deleteFeeType = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const feeType = await prisma.feeType.findUnique({
      where: { id: id },
    });

    if (!feeType) {
      return { success: false, error: true };
    }

    await prisma.feeType.delete({
      where: {
        id: id,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};