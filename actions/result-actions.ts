"use server";

import prisma from "@/lib/prisma";
import { ResultSchema } from "@/schemas/result-schema";
import { Prisma } from "@prisma/client";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

const handleForeignKeyError = (field: string): string => {
  const fieldMap: { [key: string]: string } = {
    'Result_studentId_fkey': 'Student',
    'Result_examId_fkey': 'Exam',
    'Result_subjectId_fkey': 'Subject',
    'Result_academicYearId_fkey': 'Academic Year',
    'Result_gradeId_fkey': 'Grade',
    'Result_classId_fkey': 'Class',
    'Result_gradeScaleId_fkey': 'Grade Scale',
  };
  const entity = fieldMap[field] || 'Entity';
  return `${entity} with the provided ID does not exist.`;
};

const getGradeInfo = async (score: number, gradeScaleId: number) => {
  const gradeRanges = await prisma.gradeRange.findMany({
    where: { gradeScaleId },
    orderBy: { minScore: 'desc' },
  });

  for (const range of gradeRanges) {
    if (score >= range.minScore && score <= range.maxScore) {
      return {
        resultGrade: range.letterGrade,
        remarks: range.description || '',
      };
    }
  }

  return { resultGrade: 'N/A', remarks: 'Score out of range' };
};

export const createResult = async (data: ResultSchema): Promise<ResponseState> => {
  console.log("Creating result:", data);
  try {
    const classData = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { grade: true },
    });

    if (!classData) {
      return { success: false, error: true, message: "Class not found" };
    }

    const { resultGrade, remarks } = await getGradeInfo(data.score, data.gradeScaleId);

    const result = await prisma.result.create({
      data: {
        studentId: data.studentId,
        examId: data.examId,
        subjectId: data.subjectId,
        academicYearId: data.academicYearId,
        gradeId: classData.grade.id,
        classId: data.classId,
        score: data.score,
        gradeScaleId: data.gradeScaleId,
        resultGrade,
        remarks,
      },
    });
    console.log("Result created successfully:", result);
    return { 
      success: true, 
      error: false, 
      message: "Result created successfully",
      messages: [`Grade: ${resultGrade}`, `Remarks: ${remarks}`]
    };
  } catch (err) {
    console.error("Error in createResult:", err);
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return { 
          success: false, 
          error: true, 
          message: `A result with this combination already exists. ${err.meta?.target}` 
        };
      }
      if (err.code === 'P2003') {
        const field = err.meta?.field_name as string;
        return { 
          success: false, 
          error: true, 
          message: handleForeignKeyError(field)
        };
      }
    }
    return { success: false, error: true, message: "Failed to create result" };
  }
};

export const updateResult = async (data: ResultSchema): Promise<ResponseState> => {
  console.log("Updating result:", data);
  try {
    if (!data.id) {
      throw new Error("Result ID is required for update");
    }

    const classData = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { grade: true },
    });

    if (!classData) {
      return { success: false, error: true, message: "Class not found" };
    }

    const { resultGrade, remarks } = await getGradeInfo(data.score, data.gradeScaleId);

    const result = await prisma.result.update({
      where: { id: data.id },
      data: {
        studentId: data.studentId,
        examId: data.examId,
        subjectId: data.subjectId,
        academicYearId: data.academicYearId,
        gradeId: classData.grade.id,
        classId: data.classId,
        score: data.score,
        gradeScaleId: data.gradeScaleId,
        resultGrade,
        remarks,
      },
    });
    console.log("Result updated successfully:", result);
    return { 
      success: true, 
      error: false, 
      message: "Result updated successfully",
      messages: [`Grade: ${resultGrade}`, `Remarks: ${remarks}`]
    };
  } catch (err) {
    console.error("Error in updateResult:", err);
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        return { success: false, error: true, message: "Result not found" };
      }
      if (err.code === 'P2002') {
        return { 
          success: false, 
          error: true, 
          message: `A result with this combination already exists. ${err.meta?.target}` 
        };
      }
      if (err.code === 'P2003') {
        const field = err.meta?.field_name as string;
        return { 
          success: false, 
          error: true, 
          message: handleForeignKeyError(field)
        };
      }
    }
    return { success: false, error: true, message: "Failed to update result" };
  }
};


export const deleteResult = async (currentState: ResponseState, formData: FormData): Promise<ResponseState> => {
  const id = formData.get('id');
  console.log("Deleting result with ID:", id);
  try {
    const result = await prisma.result.delete({
      where: {
        id: Number(id),
      },
    });
    console.log("Result deleted successfully:", result);
    return { success: true, error: false, message: "Result deleted successfully" };
  } catch (err) {
    console.error("Error in deleteResult:", err);
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        return { success: false, error: true, message: "Result not found" };
      }
      if (err.code === 'P2003') {
        return { 
          success: false, 
          error: true, 
          message: "Cannot delete this result as it is referenced by other records" 
        };
      }
    }
    return { success: false, error: true, message: "Failed to delete result" };
  }
};