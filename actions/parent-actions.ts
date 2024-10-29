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
      username: data.userName,
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
        userName: data.userName,
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
      try {
        await clerkClient.users.deleteUser(user.id);
      } catch (rollbackErr) {
        console.error("Error during rollback:", rollbackErr);
      }
    }

    // Handle Clerk-specific errors
    if (err.clerkError) {
      if (err.errors?.[0]?.code === 'form_password_pwned') {
        return {
          success: false,
          error: true,
          message: "Password has been found in an online data breach. Please use a different password."
        };
      }

      if (err.errors?.[0]?.code === 'form_identifier_exists') {
        return {
          success: false,
          error: true,
          message: "Username is already taken. Please choose another username."
        };
      }

      if (err.errors && err.errors.length > 0) {
        return {
          success: false,
          error: true,
          message: err.errors[0].message,
          messages: err.errors.map((e: any) => e.message)
        };
      }
    }

    // Handle Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        const targetField = err.meta?.target;
        return {
          success: false,
          error: true,
          message: `The ${targetField} is already in use. Please try another.`
        };
      }
    }

    return {
      success: false,
      error: true,
      message: err.message || "An error occurred during creation."
    };
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

    const clerkUpdateData: any = {
      username: data.userName,
      firstName: data.firstName,
      lastName: data.lastName,
    };

    if (data.password) {
      clerkUpdateData.password = data.password;
    }

    await clerkClient.users.updateUser(data.id, clerkUpdateData);

    await prisma.parent.update({
      where: { id: data.id },
      data: {
        nationalId: data.nationalId,
        firstName: data.firstName,
        lastName: data.lastName,
        userName: data.userName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        img: data.img || null,
      },
    });

    return { success: true, error: false, message: "Parent updated successfully." };
  } catch (err: any) {
    console.error("Error in updateParent:", err);

    // Handle Clerk-specific errors
    if (err.clerkError) {
      // Check if it's a password breach error
      if (err.errors?.[0]?.code === 'form_password_pwned') {
        return {
          success: false,
          error: true,
          message: "Password has been found in an online data breach. Please use a different password."
        };
      }

      // Handle username exists error
      if (err.errors?.[0]?.code === 'form_identifier_exists') {
        return {
          success: false,
          error: true,
          message: "Username is already taken. Please choose another username."
        };
      }

      // Handle any other Clerk errors by returning their specific messages
      if (err.errors && err.errors.length > 0) {
        return {
          success: false,
          error: true,
          message: err.errors[0].message,
          messages: err.errors.map((e: any) => e.message)
        };
      }
    }

    // Rollback Prisma changes if needed
    if (originalParent) {
      try {
        await prisma.parent.update({
          where: { id: data.id },
          data: originalParent,
        });

        await clerkClient.users.updateUser(data.id, {
          username: originalParent.userName,
          firstName: originalParent.firstName,
          lastName: originalParent.lastName,
        });
      } catch (rollbackErr) {
        console.error("Error during rollback: ", rollbackErr);
      }
    }

    // Handle Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        const targetField = err.meta?.target;
        return {
          success: false,
          error: true,
          message: `The ${targetField} is already in use. Please try another.`
        };
      }
    }

    // Generic error fallback
    return {
      success: false,
      error: true,
      message: err.message || "An error occurred during update."
    };
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