// schemas/fee-structure-schema.ts
import { z } from "zod";

export const feeStructureSchema = z.object({
  id: z.string().optional(),
  feeTypeId: z.string(),
  categoryIds: z.array(z.string()), // Changed from categoryId to categoryIds
  gradeIds: z.array(z.number()),
  classIds: z.array(z.number()),
  amount: z.coerce.number().min(0, "Amount must be a positive number"),
  frequency: z.string().optional(),
  academicYearId: z.coerce.number(),
  termId: z.string().optional().nullable(),
  dueDate: z.coerce.date(),
  specialProgrammes: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export type FeeStructureSchema = z.infer<typeof feeStructureSchema>;