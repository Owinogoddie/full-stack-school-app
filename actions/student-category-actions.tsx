'use server'

import prisma from "@/lib/prisma";
import { StudentCategorySchema } from "@/schemas/student-category-schema";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

// Create StudentCategory
export const createStudentCategory = async (data: StudentCategorySchema): Promise<ResponseState> => {
  try {
    await prisma.studentCategory.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
    return { success: true, error: false, message: "Student category created successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to create student category" };
  }
};

// Update StudentCategory
export const updateStudentCategory = async (data: StudentCategorySchema): Promise<ResponseState> => {
  try {
    if (!data.id) {
      throw new Error("Student Category ID is required for update");
    }

    await prisma.studentCategory.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
      },
    });
    return { success: true, error: false, message: "Student category updated successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to update student category" };
  }
};

type CurrentState = { success: boolean; error: boolean };

export const deleteStudentCategory = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const studentCategory = await prisma.studentCategory.findUnique({
      where: { id: id },
    });

    if (!studentCategory) {
      return { success: false, error: true };
    }

    await prisma.studentCategory.delete({
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