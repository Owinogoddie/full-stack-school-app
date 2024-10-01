'use server'
import prisma from "@/lib/prisma";
import { ClassSchema } from "@/schemas/class-schema";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

export const createClass = async (formData: ClassSchema): Promise<ResponseState> => {
  try {
    const { ...dataToCreate } = formData; // Exclude `id`
    await prisma.class.create({
      data: dataToCreate,
    });
    return { success: true, error: false };
  } catch (err: any) {
    console.error("Error in createClass: ", err);

    // Prisma error handling without instanceof check
    if (err?.code === "P2002") {
      const targetField = err.meta?.target;
      return { success: false, error: true, message: `The ${targetField} is already in use. Please try another.` };
    }

    return { success: false, error: true, message: err.message || "An error occurred during class creation." };
  }
};

export const updateClass = async (formData: ClassSchema): Promise<ResponseState> => {
  if (!formData.id) {
    return { success: false, error: true, message: "Class ID is required for update." };
  }

  let originalClass;
  try {
    originalClass = await prisma.class.findUnique({
      where: { id: formData.id },
    });

    if (!originalClass) {
      return { success: false, error: true, message: "Class not found." };
    }

    await prisma.class.update({
      where: { id: formData.id },
      data: formData,
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Error in updateClass: ", err);

    // Rollback on error
    if (originalClass) {
      try {
        await prisma.class.update({
          where: { id: formData.id },
          data: originalClass,
        });
      } catch (rollbackErr) {
        console.error("Error during rollback: ", rollbackErr);
      }
    }

    if (err?.code === "P2002") {
      const targetField = err.meta?.target;
      return { success: false, error: true, message: `The ${targetField} is already in use. Please try another.` };
    }

    return { success: false, error: true, message: err.message || "An error occurred during class update." };
  }
};

export const deleteClass = async (currentState: ResponseState, formData: FormData): Promise<ResponseState> => {
  const id = formData.get("id") as string;
  if (!id) {
    return { success: false, error: true, message: "Class ID is required for deletion." };
  }

  try {
    await prisma.class.delete({
      where: { id: parseInt(id) },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Error in deleteClass: ", err);

    if (err?.code === "P2025") {
      return { success: false, error: true, message: "Class not found." };
    }

    return { success: false, error: true, message: err.message || "An error occurred during class deletion." };
  }
};
