import { z } from "zod";

export enum ExamType {
  MIDTERM = "MIDTERM",
  END_TERM = "END_TERM",
  MOCK = "MOCK",
  FINAL = "FINAL",
  ASSIGNMENT = "ASSIGNMENT",
  QUIZ = "QUIZ",
  NATIONAL = "NATIONAL",
}

export const resultSchema = z.object({
  id: z.coerce.number().optional(),
  score: z.coerce.number().min(0, "Score is required!"),
  studentId: z.string(),
  subjectId: z.coerce.number().nonnegative("Subject ID is required!"),
  academicYearId: z.coerce.number().nonnegative("Academic Year ID is required!"),
  classId: z.coerce.number().nonnegative("Class ID is required!"),
  gradeScaleId: z.coerce.number().nonnegative("Grade Scale ID is required!"),
  examId: z.coerce.number().nonnegative("Exam ID is required!"),
  term: z.coerce.number().int().optional(),
  examType: z.nativeEnum(ExamType).optional(),
});

export type ResultSchema = z.infer<typeof resultSchema>;