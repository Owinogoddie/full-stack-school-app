"use server";

import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { ParentSchema } from "@/schemas/parent-schema";
import { Prisma } from "@prisma/client";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

export const createParent = async (data: ParentSchema): Promise<ResponseState> => {
  let user;
  if (!data.password) {
    return {
      success: false,
      error: true,
      message: "Password is required for creation.",
    };
  }
  try {
    user = await clerkClient.users.createUser({
      username:data.userName,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      publicMetadata: { role: "parent" },
    });

    await prisma.parent.create({
      data: {
        id: user.id,
        nationalId: data.nationalId,
        firstName: data.firstName,
        lastName: data.lastName,
        userName:data.userName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        img: data.img || null,
      },
    });

    return { success: true, error: false, message: "Parent created successfully." };
  } catch (err: any) {
    console.error("Error in createParent:", err);

    // Rollback Clerk user creation if Prisma fails
    if (user) {
      await clerkClient.users.deleteUser(user.id);
    }

    // If Prisma or Clerk error has `errors`, return all error messages
    if (err.errors) {
      const errorMessages = err.errors.map((e: any) => e.message);
      return { success: false, error: true, messages: errorMessages };
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        const targetField = err.meta?.target;
        return { success: false, error: true, message: `The ${targetField} is already in use. Please try another.` };
      }
    }

    return { success: false, error: true, message: err.message || "An error occurred during creation." };
  }
};

export const updateParent = async (data: ParentSchema): Promise<ResponseState> => {
  if (!data.id) {
    return { success: false, error: true, message: "Parent ID is required for update." };
  }

  let originalParent;
  try {
    // Fetch original parent data for potential rollback
    originalParent = await prisma.parent.findUnique({
      where: { id: data.id },
    });

    if (!originalParent) {
      return { success: false, error: true, message: "Parent not found." };
    }

    // Update user in Clerk
    await clerkClient.users.updateUser(data.id, {
      username:data.userName,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    // Update parent in Prisma
    await prisma.parent.update({
      where: { id: data.id },
      data: {
        nationalId: data.nationalId,
        firstName: data.firstName,
        lastName: data.lastName,
        userName:data.userName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        img: data.img || null,
      },
    });

    return { success: true, error: false, message: "Parent updated successfully." };
  } catch (err: any) {
    console.error("Error in updateParent:", err);

    // Rollback Prisma changes
    if (originalParent) {
      try {
        await prisma.parent.update({
          where: { id: data.id },
          data: originalParent,
        });

        // Rollback Clerk changes
        await clerkClient.users.updateUser(data.id, {
          username: originalParent.userName,
          firstName: originalParent.firstName,
          lastName: originalParent.lastName,
        });
      } catch (rollbackErr) {
        console.error("Error during rollback: ", rollbackErr);
      }
    }

    // If Prisma or Clerk error has `errors`, return all error messages
    if (err.errors) {
      const errorMessages = err.errors.map((e: any) => e.message);
      return { success: false, error: true, messages: errorMessages };
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        const targetField = err.meta?.target;
        return { success: false, error: true, message: `The ${targetField} is already in use. Please try another.` };
      }
    }

    return { success: false, error: true, message: err.message || "An error occurred during update." };
  }
};

export const deleteParent = async (
  prevState: ResponseState,
  formData: FormData
): Promise<ResponseState> => {
  const id = formData.get('id') as string;
  if (!id) {
    return { success: false, error: true, message: "Parent ID is required for deletion." };
  }
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.parent.delete({
      where: {
        id: id,
      },
    });

    return { success: true, error: false, message: "Parent deleted successfully." };
  } catch (err: any) {
    console.error("Error in deleteParent: ", err);

    // If Prisma or Clerk error has `errors`, return all error messages
    if (err.errors) {
      const errorMessages = err.errors.map((e: any) => e.message);
      return { success: false, error: true, messages: errorMessages };
    }

    // Handle Prisma known errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return { success: false, error: true, message: "Parent not found." };
      }
    }

    return { success: false, error: true, message: err.message || "An error occurred during deletion." };
  }
};