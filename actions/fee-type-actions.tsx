'use server'

import prisma from "@/lib/prisma";
import { FeeTypeSchema } from "@/schemas/fee-type-schema";
import { logFeeChange } from "@/lib/feeLogger";
import { auth } from "@clerk/nextjs/server";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};
const { userId } = auth();
// Create FeeType
export const createFeeType = async (data: FeeTypeSchema): Promise<ResponseState> => {
  try {
    const newFeeType = await prisma.feeType.create({
      data: {
        name: data.name,
        description: data.description,
        amount: data.amount,
      },
    });

    // Log the creation
    await logFeeChange({
      entityType: 'FEE_TYPE',
      entityId: newFeeType.id,
      action: 'CREATE',
      changes: {
        name: data.name,
        description: data.description,
        amount: data.amount
      },
      performedBy: userId || 'SYSTEM'
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

    // Get original data for audit
    const originalFeeType = await prisma.feeType.findUnique({
      where: { id: data.id }
    });

    await prisma.feeType.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        amount: data.amount,
      },
    });

   // Log the update
await logFeeChange({
  entityType: 'FEE_TYPE',
  entityId: data.id,
  action: 'UPDATE',
  changes: {
    old: {
      name: originalFeeType?.name,
      description: originalFeeType?.description,
      amount: originalFeeType?.amount
    },
    new: {
      name: data.name,
      description: data.description,
      amount: data.amount
    }
  },
  performedBy: userId || 'SYSTEM',
  // If amount changed, include fee amount change
  ...(originalFeeType?.amount !== data.amount && {
    feeAmountChange: {
      feeTemplateId: data.id,
      previousAmount: originalFeeType?.amount ?? undefined, // Ensure no `null`
      newAmount: data.amount,
      reason: 'Fee type amount update'
    }
  })
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

    // Log the deletion
    await logFeeChange({
      entityType: 'FEE_TYPE',
      entityId: id,
      action: 'DELETE',
      changes: {
        deletedFeeType: feeType
      },
      performedBy: data.get("userId") as string || 'SYSTEM'
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};