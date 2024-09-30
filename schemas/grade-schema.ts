import { z } from "zod";

export const gradeSchema = z.object({
  id: z.coerce.number().optional(),
  level: z.coerce.number().min(1, { message: "Grade level is required and must be at least 1!" }),
});

export type GradeSchema = z.infer<typeof gradeSchema>;