'use server'
import prisma from "@/lib/prisma";
import { AcademicYearSchema } from "@/schemas/academic-year-schema";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

export const createAcademicYear = async (data: AcademicYearSchema): Promise<ResponseState> => {
  console.log(data)
  try {
    await prisma.academicYear.create({
      data: {
        year: data.year,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });
    return { success: true, error: false, message: "Academic year created successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to create academic year" };
  }
};

export const updateAcademicYear = async (data: AcademicYearSchema): Promise<ResponseState> => {
  try {
    if (!data.id) {
      throw new Error("Academic Year ID is required for update");
    }
    await prisma.academicYear.update({
      where: { id: data.id },
      data: {
        year: data.year,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });
    return { success: true, error: false, message: "Academic year updated successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to update academic year" };
  }
};

export const deleteAcademicYear = async (currentState: ResponseState, formData: FormData): Promise<ResponseState> => {
  const id = formData.get('id');
  try {
    await prisma.academicYear.delete({
      where: {
        id: Number(id),
      },
    });
    return { success: true, error: false, message: "Academic Year deleted successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to delete Academic Year" };
  }
};
