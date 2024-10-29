// actions/admission-number-pattern-actions.ts
'use server'

import prisma from "@/lib/prisma";
import { AdmissionNumberPatternSchema } from "@/schemas/admission-pattern-schema";
import { z } from "zod";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  data?: any;
};

export const generateNextAdmissionNumber = async (schoolId: string): Promise<string> => {
  const pattern = await prisma.admissionNumberPattern.findUnique({
    where: { schoolId },
  });

  if (!pattern) {
    throw new Error("Admission number pattern not configured for this school");
  }

  const currentYear = new Date().getFullYear();
  const yearStr = pattern.yearFormat === "YY" 
    ? currentYear.toString().slice(-2) 
    : currentYear.toString();
  
  const nextNumber = (pattern.lastNumber + 1)
    .toString()
    .padStart(pattern.digitCount, "0");
  
  const separator = pattern.separator || "";
  
  return `${pattern.prefix}${separator}${yearStr}${separator}${nextNumber}`;
};

export const createAdmissionPattern = async (
  data: AdmissionNumberPatternSchema
): Promise<ResponseState> => {
  try {
    // Validate the data
    const validatedData = AdmissionNumberPatternSchema.parse(data);

    // Check if pattern already exists for the school
    if(validatedData.schoolId){
      const existingPattern = await prisma.admissionNumberPattern.findUnique({
        where: { schoolId: validatedData.schoolId },
      });
  
      if (existingPattern) {
        return {
          success: false,
          error: true,
          message: "An admission pattern already exists for this school",
        };
      }
    }

    // Create the pattern with school connection
    const pattern = await prisma.admissionNumberPattern.create({
      data: {
        prefix: validatedData.prefix,
        yearFormat: validatedData.yearFormat,
        digitCount: validatedData.digitCount,
        separator: validatedData.separator,
        lastNumber: validatedData.lastNumber,
        ...(validatedData.schoolId ? {
          school: {
            connect: {
              id: validatedData.schoolId
            }
          }
        } : {})
      },
    });

    return {
      success: true,
      error: false,
      message: "Admission pattern created successfully",
      data: pattern,
    };
  } catch (error) {
    console.error("Error creating admission pattern:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: true,
        message: "Validation error",
        data: error.errors,
      };
    }
    return {
      success: false,
      error: true,
      message: "Failed to create admission pattern",
    };
  }
};

export const updateAdmissionPattern = async (
  data: AdmissionNumberPatternSchema
): Promise<ResponseState> => {
  try {
    // Validate the data
    const validatedData = AdmissionNumberPatternSchema.parse(data);

    // Check if pattern exists
    const existingPattern = await prisma.admissionNumberPattern.findUnique({
      where: { schoolId: validatedData.schoolId },
    });

    if (!existingPattern) {
      return {
        success: false,
        error: true,
        message: "Admission pattern not found",
      };
    }

    // Update only the pattern fields, not the relation
    const pattern = await prisma.admissionNumberPattern.update({
      where: { schoolId: validatedData.schoolId },
      data: {
        prefix: validatedData.prefix,
        yearFormat: validatedData.yearFormat,
        digitCount: validatedData.digitCount,
        separator: validatedData.separator,
        lastNumber: validatedData.lastNumber,
      },
    });

    return {
      success: true,
      error: false,
      message: "Admission pattern updated successfully",
      data: pattern,
    };
  } catch (error) {
    console.error("Error updating admission pattern:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: true,
        message: "Validation error",
        data: error.errors,
      };
    }
    return {
      success: false,
      error: true,
      message: "Failed to update admission pattern",
    };
  }
};

export const deleteAdmissionPattern = async (
  currentState: ResponseState,
  data: FormData
): Promise<ResponseState> => {
  try {
    const idValue = data.get("id");

    // Ensure 'id' is not null and can be converted to a number
    if (!idValue || typeof idValue !== "string" || isNaN(Number(idValue))) {
      return { success: false, error: true, message: "Invalid academic year ID" };
    }

    const id = Number(idValue); // Convert to number
    // Check if pattern exists
    const existingPattern = await prisma.admissionNumberPattern.findUnique({
      where: { id },
    });

    if (!existingPattern) {
      return {
        success: false,
        error: true,
        message: "Admission pattern not found",
      };
    }

    // Delete the pattern
    await prisma.admissionNumberPattern.delete({
      where: { id },
    });

    return {
      success: true,
      error: false,
      message: "Admission pattern deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting admission pattern:", error);
    return {
      success: false,
      error: true,
      message: "Failed to delete admission pattern",
    };
  }
};

export const updateAdmissionPatternLastNumber = async (
  schoolId: string,
  newLastNumber: number
): Promise<ResponseState> => {
  try {
    const updated = await prisma.admissionNumberPattern.update({
      where: { schoolId },
      data: { lastNumber: newLastNumber },
    });

    return {
      success: true,
      error: false,
      message: "Last number updated successfully",
      data: updated,
    };
  } catch (error) {
    console.error("Error updating admission pattern last number:", error);
    return {
      success: false,
      error: true,
      message: "Failed to update last number",
    };
  }
};