import { z } from "zod";

export const subjectSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Subject name is required"),
  code: z.string().min(1, "Subject code is required"),
  description: z.string().optional(),
});

export type SubjectSchema = z.infer<typeof subjectSchema>;