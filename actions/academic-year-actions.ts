'use server'
import prisma from "@/lib/prisma";
import { AcademicYearSchema } from "@/schemas/academic-year-schema";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

// Create Academic Year
export const createAcademicYear = async (data: AcademicYearSchema): Promise<ResponseState> => {
  try {
    // If the new academic year is set as current, set others to not current
    if (data.currentAcademicYear) {
      await prisma.academicYear.updateMany({
        where: { currentAcademicYear: true }, // Find current academic years
        data: { currentAcademicYear: false }, // Set them to false
      });
    }

    // Create the new academic year
    await prisma.academicYear.create({
      data: {
        year: data.year,
        startDate: data.startDate,
        endDate: data.endDate,
        currentAcademicYear: data.currentAcademicYear, // New field
      },
    });
    return { success: true, error: false, message: "Academic year created successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to create academic year" };
  }
};

// Update Academic Year
export const updateAcademicYear = async (data: AcademicYearSchema): Promise<ResponseState> => {
  try {
    if (!data.id) {
      throw new Error("Academic Year ID is required for update");
    }

    // If the updated academic year is set as current, set others to not current
    if (data.currentAcademicYear) {
      await prisma.academicYear.updateMany({
        where: { currentAcademicYear: true, id: { not: data.id } }, // Find current years excluding the one being updated
        data: { currentAcademicYear: false }, // Set them to false
      });
    }

    // Update the academic year
    await prisma.academicYear.update({
      where: { id: data.id },
      data: {
        year: data.year,
        startDate: data.startDate,
        endDate: data.endDate,
        currentAcademicYear: data.currentAcademicYear, // New field
      },
    });
    return { success: true, error: false, message: "Academic year updated successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to update academic year" };
  }
};
type CurrentState = { success: boolean; error: boolean };
export const deleteAcademicYear = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string; // Extract the ID from the FormData
  try {
    // Optional: Check if the academic year exists before attempting to delete
    const academicYear = await prisma.academicYear.findUnique({
      where: { id: parseInt(id) },
    });

    if (!academicYear) {
      return { success: false, error: true }; // Return an error if the academic year doesn't exist
    }

    await prisma.academicYear.delete({
      where: {
        id: parseInt(id), // Delete by ID
      },
    });

    return { success: true, error: false }; // Successful deletion
  } catch (err) {
    console.log(err);
    return { success: false, error: true }; // Error handling
  }
};
