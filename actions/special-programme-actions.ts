// actions/special-programme-actions.ts
'use server'

import prisma from "@/lib/prisma";
import { SpecialProgrammeSchema } from "@/schemas/special-programme-schema";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

export const createSpecialProgramme = async (data: SpecialProgrammeSchema): Promise<ResponseState> => {
  try {
    await prisma.specialProgramme.create({
      data: {
        name: data.name,
        description: data.description,
        // schoolId: data.schoolId,
        grades: {
          connect: data.grades?.map((id) => ({ id })) || [],
        },
        classes: {
          connect: data.classes?.map((id) => ({ id })) || [],
        },
        students: {
          connect: data.students?.map((id) => ({ id })) || [],
        },
      },
    });

    return { success: true, error: false, message: "Special programme created successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to create special programme" };
  }
};

export const updateSpecialProgramme = async (data: SpecialProgrammeSchema): Promise<ResponseState> => {
  try {
    if (!data.id) {
      throw new Error("Special Programme ID is required for update");
    }

    await prisma.specialProgramme.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        // schoolId: data.schoolId,
        grades: {
          set: [], // Clear existing connections
          connect: data.grades?.map((id) => ({ id })) || [],
        },
        classes: {
          set: [], // Clear existing connections
          connect: data.classes?.map((id) => ({ id })) || [],
        },
        students: {
          set: [], // Clear existing connections
          connect: data.students?.map((id) => ({ id })) || [],
        },
      },
    });

    return { success: true, error: false, message: "Special programme updated successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to update special programme" };
  }
};

export const deleteSpecialProgramme = async (
    prevState: ResponseState,
    formData: FormData
  ): Promise<ResponseState> => {
  try {
    
  const id = formData.get("id") as string;
    await prisma.specialProgramme.delete({
      where: { id },
    });

    return { success: true, error: false, message: "Special programme deleted successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to delete special programme" };
  }
};