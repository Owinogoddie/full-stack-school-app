"use server";

import prisma from "@/lib/prisma";
import { ResultSchema } from "@/schemas/result-schema";
import { ExamType } from "@prisma/client";

type CurrentState = { success: boolean; error: boolean };

export const createResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    await prisma.result.create({
      data: {
        score: data.score,
        studentId: data.studentId,
        subjectId: data.subjectId,
        academicYearId: data.academicYearId,
        gradeId: data.gradeId,
        classId: data.classId,
        resultgrade: data.resultGrade,
        remarks: data.remarks,
        term: data.term,
        examType: data.examType as ExamType,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    await prisma.result.update({
      where: {
        id: data.id,
      },
      data: {
        score: data.score,
        studentId: data.studentId,
        subjectId: data.subjectId,
        academicYearId: data.academicYearId,
        gradeId: data.gradeId,
        classId: data.classId,
        resultgrade: data.resultGrade,
        remarks: data.remarks,
        term: data.term,
        examType: data.examType as ExamType,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteResult = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.result.delete({
      where: {
        id: parseInt(id),
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
