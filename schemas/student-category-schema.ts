// schemas/student-category-schema.ts
import { z } from "zod";

export const studentCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters long"),
  description: z.string().optional(),
});

export type StudentCategorySchema = z.infer<typeof studentCategorySchema>;