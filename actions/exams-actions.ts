'use server'

import prisma from "@/lib/prisma";
import { ExamSchema } from "@/schemas/exam-schema";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

export const createExam = async (data: ExamSchema): Promise<ResponseState> => {
  try {
    await prisma.exam.create({
      data: {
        title: data.title,
        description: data.description,
        examType: data.examType,
        startDate: data.startDate,
        endDate: data.endDate,
        lessonId: data.lessonId,
        subjectId: data.subjectId,
        gradeId: data.gradeId,
        academicYearId: data.academicYearId,
        schoolId: data.schoolId,
      },
    });
    return { success: true, error: false, message: "Exam created successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to create exam" };
  }
};

export const updateExam = async (data: ExamSchema): Promise<ResponseState> => {
  try {
    if (!data.id) {
      throw new Error("Exam ID is required for update");
    }
    await prisma.exam.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        examType: data.examType,
        startDate: data.startDate,
        endDate: data.endDate,
        lessonId: data.lessonId,
        subjectId: data.subjectId,
        gradeId: data.gradeId,
        academicYearId: data.academicYearId,
        schoolId: data.schoolId,
      },
    });
    return { success: true, error: false, message: "Exam updated successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to update exam" };
  }
};

export const deleteExam = async (currentState: ResponseState, formData: FormData): Promise<ResponseState> => {
  const id = formData.get('id');
  try {
    await prisma.exam.delete({
      where: {
        id: Number(id),
      },
    });
    return { success: true, error: false, message: "Exam deleted successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to delete exam" };
  }
};