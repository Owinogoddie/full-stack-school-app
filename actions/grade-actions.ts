"use server"

import prisma from "@/lib/prisma";
import { GradeSchema } from "@/schemas/grade-schema";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

export const createGrade = async (data: GradeSchema): Promise<ResponseState> => {
  try {
    await prisma.grade.create({
      data: {
        levelName: data.levelName,
        stage: data.stage,
        description: data.description,
      },
    });
    return { success: true, error: false, message: "Grade created successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to create grade" };
  }
};

export const updateGrade = async (data: GradeSchema): Promise<ResponseState> => {
  try {
    if (!data.id) {
      throw new Error("Grade ID is required for update");
    }
    await prisma.grade.update({
      where: {
        id: data.id,
      },
      data: {
        levelName: data.levelName,
        stage: data.stage,
        description: data.description,
      },
    });
    return { success: true, error: false, message: "Grade updated successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to update grade" };
  }
};

export const deleteGrade = async (currentState: ResponseState, formData: FormData): Promise<ResponseState> => {
  const id = formData.get('id');
  console.log(id, "...............................")
  try {
    await prisma.grade.delete({
      where: {
        id: Number(id),
      },
    });
    return { success: true, error: false, message: "Grade deleted successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to delete grade" };
  }
};