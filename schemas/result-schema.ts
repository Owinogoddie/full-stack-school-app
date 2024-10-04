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
  id: z.coerce.number().optional(), // Use coerce to handle both strings and numbers
  score: z.coerce.number().min(0, "Score is required!"),
  studentId: z.string(), // Assuming this will remain a string
  subjectId: z.coerce.number().nonnegative("Subject ID is required!"),
  academicYearId: z.coerce.number().nonnegative("Academic Year ID is required!"),
  gradeId: z.coerce.number().nonnegative("Grade ID is required!"),
  classId: z.coerce.number().optional(),
  gradeScaleId: z.coerce.number().optional(),
  examId: z.coerce.number().nonnegative("Exam ID is required!"),
  resultGrade: z.string().optional(), // e.g., "A", "B", "C", etc.
  term: z.coerce.number().int().optional(),
  examType: z.nativeEnum(ExamType).optional(),
  remarks: z.string().nullable().optional(),
});

export type ResultSchema = z.infer<typeof resultSchema>;
