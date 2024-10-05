"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

type BulkResultInput = {
  studentId: number;
  examId: number;
  subjectId: number;
  academicYearId: number;
  classId: number;
  gradeScaleId: number;
  score: number;
};

const handleForeignKeyError = (field: string): string => {
  const fieldMap: { [key: string]: string } = {
    Result_studentId_fkey: "Student",
    Result_examId_fkey: "Exam",
    Result_subjectId_fkey: "Subject",
    Result_academicYearId_fkey: "Academic Year",
    Result_gradeId_fkey: "Grade",
    Result_classId_fkey: "Class",
    Result_gradeScaleId_fkey: "Grade Scale",
  };
  const entity = fieldMap[field] || "Entity";
  return `${entity} with the provided ID does not exist.`;
};

const getGradeInfo = async (score: number, gradeScaleId: number) => {
  const gradeRanges = await prisma.gradeRange.findMany({
    where: { gradeScaleId },
    orderBy: { minScore: "desc" },
  });

  for (const range of gradeRanges) {
    if (score >= range.minScore && score <= range.maxScore) {
      return {
        resultGrade: range.letterGrade,
        remarks: range.description || "",
      };
    }
  }

  return { resultGrade: "N/A", remarks: "Score out of range" };
};

export const createBulkResults = async (
  results: BulkResultInput[]
): Promise<ResponseState> => {
  console.log("Creating bulk results:", results);
  try {
    const processedResults = await Promise.all(
      results.map(async (result) => {
        const classData = await prisma.class.findUnique({
          where: { id: result.classId },
          include: { grade: true },
        });

        if (!classData) {
          throw new Error(
            `Class not found for result: ${JSON.stringify(result)}`
          );
        }

        const { resultGrade, remarks } = await getGradeInfo(
          result.score,
          result.gradeScaleId
        );

        return {
          studentId: result.studentId.toString(), // Convert to string if your Prisma schema uses string
          examId: result.examId,
          subjectId: result.subjectId,
          academicYearId: result.academicYearId,
          gradeId: classData.grade.id,
          classId: result.classId,
          score: result.score,
          gradeScaleId: result.gradeScaleId,
          resultGrade,
          remarks,
        };
      })
    );

    await prisma.$transaction(
      processedResults.map((result) =>
        prisma.result.upsert({
          where: {
            studentId_examId_subjectId: {
              studentId: result.studentId,
              examId: result.examId,
              subjectId: result.subjectId,
            },
          },
          update: {
            score: result.score,
            academicYearId: result.academicYearId,
            classId: result.classId,
            gradeScaleId: result.gradeScaleId,
            resultGrade: result.resultGrade,
            remarks: result.remarks,
          },
          create: result,
        })
      )
    );

    return {
      success: true,
      error: false,
      message: "Bulk results created/updated successfully",
    };
  } catch (err) {
    console.error("Error in createBulkResults:", err);
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return {
          success: false,
          error: true,
          message: `A result with this combination already exists. ${err.meta?.target}`,
        };
      }
      if (err.code === "P2003") {
        const field = err.meta?.field_name as string;
        return {
          success: false,
          error: true,
          message: handleForeignKeyError(field),
        };
      }
    }
    return {
      success: false,
      error: true,
      message:
        err instanceof Error ? err.message : "Failed to create bulk results",
    };
  }
};