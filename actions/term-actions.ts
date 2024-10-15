'use server'

import prisma from "@/lib/prisma";
import { TermSchema } from "@/schemas/term-schema";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

// Create Term
export const createTerm = async (data: TermSchema): Promise<ResponseState> => {
  try {
    await prisma.term.create({
      data: {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        academicYearId: data.academicYearId,
      },
    });
    return { success: true, error: false, message: "Term created successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to create term" };
  }
};

// Update Term
export const updateTerm = async (data: TermSchema): Promise<ResponseState> => {
  try {
    if (!data.id) {
      throw new Error("Term ID is required for update");
    }

    await prisma.term.update({
      where: { id: data.id },
      data: {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        academicYearId: data.academicYearId,
      },
    });
    return { success: true, error: false, message: "Term updated successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to update term" };
  }
};

type CurrentState = { success: boolean; error: boolean };

export const deleteTerm = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const term = await prisma.term.findUnique({
      where: { id: id },
    });

    if (!term) {
      return { success: false, error: true };
    }

    await prisma.term.delete({
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