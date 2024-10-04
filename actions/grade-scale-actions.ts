'use server'

import prisma from "@/lib/prisma";
import { GradeScaleSchema } from "@/schemas/grade-scale-schema";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

export const createGradeScale = async (data: GradeScaleSchema): Promise<ResponseState> => {
  try {
    await prisma.gradeScale.create({
      data: {
        name: data.name,
        schoolId: data.schoolId,
        examTypes: data.examTypes,
        isDefault: data.isDefault,
        ranges: {
          create: data.ranges.map(range => ({
            letterGrade: range.letterGrade,
            minScore: range.minScore,
            maxScore: range.maxScore,
            gpa: range.gpa,
            description: range.description,
          }))
        }
      },
    });
    return { success: true, error: false, message: "Grade scale created successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to create grade scale" };
  }
};

export const updateGradeScale = async (data: GradeScaleSchema): Promise<ResponseState> => {
  try {
    if (!data.id) {
      throw new Error("Grade scale ID is required for update");
    }
    await prisma.gradeScale.update({
      where: { id: data.id },
      data: {
        name: data.name,
        schoolId: data.schoolId,
        examTypes: data.examTypes,
        isDefault: data.isDefault,
        ranges: {
          deleteMany: {},
          create: data.ranges.map(range => ({
            letterGrade: range.letterGrade,
            minScore: range.minScore,
            maxScore: range.maxScore,
            gpa: range.gpa,
            description: range.description,
          }))
        }
      },
    });
    return { success: true, error: false, message: "Grade scale updated successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to update grade scale" };
  }
};

export const deleteGradeScale = async (currentState: ResponseState, formData: FormData): Promise<ResponseState> => {
  const id = formData.get('id');
  try {
    await prisma.gradeScale.delete({
      where: {
        id: Number(id),
      },
    });
    return { success: true, error: false, message: "Grade scale deleted successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to delete grade scale" };
  }
};