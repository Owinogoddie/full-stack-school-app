'use server'

import prisma  from "@/lib/prisma";
import { AcademicYearSchema } from "@/schemas/academic-year-schema";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

export const createAcademicYear = async (data: AcademicYearSchema): Promise<ResponseState> => {
  try {
    // If the new academic year is set as current, set others to not current
    if (data.currentAcademicYear) {
      await prisma.academicYear.updateMany({
        where: { currentAcademicYear: true },
        data: { currentAcademicYear: false },
      });
    }

    // Create the new academic year with terms
    await prisma.academicYear.create({
      data: {
        year: data.year,
        startDate: data.startDate,
        endDate: data.endDate,
        currentAcademicYear: data.currentAcademicYear,
        terms: {
          create: data.terms.map((term) => ({
            name: term.name,
            startDate: term.startDate,
            endDate: term.endDate,
          })),
        },
      },
      include: {
        terms: true,
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

    // If the updated academic year is set as current, set others to not current
    if (data.currentAcademicYear) {
      await prisma.academicYear.updateMany({
        where: { currentAcademicYear: true, id: { not: data.id } },
        data: { currentAcademicYear: false },
      });
    }

    // Update the academic year and its terms
    await prisma.academicYear.update({
      where: { id: data.id },
      data: {
        year: data.year,
        startDate: data.startDate,
        endDate: data.endDate,
        currentAcademicYear: data.currentAcademicYear,
        terms: {
          deleteMany: {}, // Delete existing terms
          create: data.terms.map((term) => ({
            name: term.name,
            startDate: term.startDate,
            endDate: term.endDate,
          })),
        },
      },
      include: {
        terms: true,
      },
    });

    return { success: true, error: false, message: "Academic year updated successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to update academic year" };
  }
};

export const deleteAcademicYear = async (
  currentState: ResponseState,
  formData: FormData
): Promise<ResponseState> => {
  try {
    // Get the 'id' from FormData
    const idValue = formData.get("id");

    // Ensure 'id' is not null and can be converted to a number
    if (!idValue || typeof idValue !== "string" || isNaN(Number(idValue))) {
      return { success: false, error: true, message: "Invalid academic year ID" };
    }

    const id = Number(idValue); // Convert to number

    // Check if the academic year exists before attempting to delete
    const academicYear = await prisma.academicYear.findUnique({
      where: { id },
    });

    if (!academicYear) {
      return { success: false, error: true, message: "Academic year not found" };
    }

    // Delete the academic year and its associated terms
    await prisma.academicYear.delete({
      where: { id },
    });

    return { success: true, error: false, message: "Academic year deleted successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to delete academic year" };
  }
};
