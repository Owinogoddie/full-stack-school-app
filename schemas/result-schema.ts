import { z } from "zod";

export const resultSchema = z.object({
  id: z.number().optional(),
  score: z.number().min(0, "Score is required!"),
  examId: z.number().optional(),
  assignmentId: z.number().optional(),
  studentId: z.string(),
});

export type ResultSchema = z.infer<typeof resultSchema>;
