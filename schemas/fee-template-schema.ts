// schemas/fee-template-schema.ts
import { z } from "zod";

export const feeTemplateSchema = z.object({
  id: z.string().optional(),
  schoolId: z.string().optional(),
  academicYearId: z.coerce.number(),
  termId: z.string(),
  feeTypeId: z.string(),
  baseAmount: z.coerce.number().min(0, "Amount must be a positive number"),
  version: z.number().optional(),
  isActive: z.boolean().optional(),
});

export type FeeTemplateSchema = z.infer<typeof feeTemplateSchema>;