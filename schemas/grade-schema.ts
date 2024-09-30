import { z } from "zod";

export const gradeSchema = z.object({
  id: z.number().optional(),
  level: z.number().min(1, "Grade level is required!"),
  classess: z.array(z.string()).optional(), // Array of class ids
});

export type GradeSchema = z.infer<typeof gradeSchema>;
