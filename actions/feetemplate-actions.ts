'use server'

import prisma from "@/lib/prisma";
import { FeeTemplateSchema } from "@/schemas/fee-template-schema";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

// Create FeeTemplate
export const createFeeTemplate = async (data: FeeTemplateSchema): Promise<ResponseState> => {
  try {
    await prisma.feeTemplate.create({
      data: {
        grades: { connect: data.gradeIds.map(id => ({ id: parseInt(id) })) },
        classes: data.classIds ? { connect: data.classIds.map(id => ({ id: parseInt(id) })) } : undefined,
        academicYear: { connect: { id: parseInt(data.academicYearId) } },
        term: { connect: { id: data.termId } },
        feeType: { connect: { id: data.feeTypeId } },
        studentCategories: data.studentCategoryIds ? { connect: data.studentCategoryIds.map(id => ({ id })) } : undefined,
        baseAmount: data.baseAmount,
        // school: data.schoolId ? { connect: { id: data.schoolId } } : undefined,
      },
    });
    return { success: true, error: false, message: "Fee template created successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to create fee template" };
  }
};

// Update FeeTemplate
export const updateFeeTemplate = async (data: FeeTemplateSchema): Promise<ResponseState> => {
  try {
    if (!data.id) {
      throw new Error("Fee Template ID is required for update");
    }

    await prisma.feeTemplate.update({
      where: { id: data.id },
      data: {
        grades: { set: data.gradeIds.map(id => ({ id: parseInt(id) })) },
        classes: data.classIds ? { set: data.classIds.map(id => ({ id: parseInt(id) })) } : undefined,
        academicYear: { connect: { id: parseInt(data.academicYearId) } },
        term: { connect: { id: data.termId } },
        feeType: { connect: { id: data.feeTypeId } },
        studentCategories: data.studentCategoryIds ? { set: data.studentCategoryIds.map(id => ({ id })) } : undefined,
        baseAmount: data.baseAmount,
        // school: data.schoolId ? { connect: { id: data.schoolId } } : undefined,
      },
    });
    return { success: true, error: false, message: "Fee template updated successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to update fee template" };
  }
};

// Delete FeeTemplate
export const deleteFeeTemplate = async (id: string): Promise<ResponseState> => {
  try {
    const feeTemplate = await prisma.feeTemplate.findUnique({
      where: { id: id },
    });

    if (!feeTemplate) {
      return { success: false, error: true, message: "Fee template not found" };
    }

    await prisma.feeTemplate.delete({
      where: {
        id: id,
      },
    });

    return { success: true, error: false, message: "Fee template deleted successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to delete fee template" };
  }
};

// // Get FeeTemplate by ID
// export const getFeeTemplateById = async (id: string): Promise<FeeTemplateSchema | null> => {
//   try {
//     const feeTemplate = await prisma.feeTemplate.findUnique({
//       where: { id: id },
//       include: {
//         grades: true,
//         classes: true,
//         term: true,
//         feeType: true,
//         studentCategories: true,
//         // school: true,
//       },
//     });

//     return feeTemplate;
//   } catch (err) {
//     console.error(err);
//     return null;
//   }
// };

// // Get all FeeTemplates
// export const getAllFeeTemplates = async (): Promise<FeeTemplateSchema[]> => {
//   try {
//     const feeTemplates = await prisma.feeTemplate.findMany({
//       include: {
//         grades: true,
//         classes: true,
//         term: true,
//         feeType: true,
//         studentCategories: true,
//         school: true,
//       },
//     });

//     return feeTemplates;
//   } catch (err) {
//     console.error(err);
//     return [];
//   }
// };