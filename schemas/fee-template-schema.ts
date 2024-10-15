// schemas/fee-template-schema.ts
import { z } from "zod";

export const feeTemplateSchema = z.object({
  id: z.string().optional(),
  gradeIds: z.array(z.string()),
  classIds: z.array(z.string()).optional(),
  academicYearId: z.string(),
  termId: z.string(),
  feeTypeId: z.string(),
  studentCategoryIds: z.array(z.string()).optional(),
  baseAmount: z.number().min(0, "Base amount must be a positive number"),
});

export type FeeTemplateSchema = z.infer<typeof feeTemplateSchema>;