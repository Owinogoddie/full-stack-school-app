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
  id: z.number().optional(),
  score: z.number().min(0, "Score is required!"),
  studentId: z.string(),
  subjectId: z.number().nonnegative("Subject ID is required!"),
  academicYearId: z.number().nonnegative("Academic Year ID is required!"),
  gradeId: z.number().nonnegative("Grade ID is required!"),
  classId: z.number().optional(),
  resultGrade: z.string().optional(), // e.g., "A", "B", "C", etc.
  remarks: z.string().optional(),
  term: z.number().int().min(1, "Term must be at least 1."),
  examType: z.nativeEnum(ExamType)
});

export type ResultSchema = z.infer<typeof resultSchema>;
