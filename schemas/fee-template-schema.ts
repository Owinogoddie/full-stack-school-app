// schemas/fee-template-schema.ts
import { z } from "zod";

export const feeTemplateSchema = z.object({
  id: z.string().optional(),
  gradeClasses: z.array(
    z.object({
      gradeId: z.string(),
      classes: z.array(z.string())
    })
  ),
  academicYearId: z.coerce.number(),
  termId: z.string(),
  feeTypeId: z.string(),
  studentCategoryIds: z.array(z.string()).optional(),

  specialProgrammeId: z.string().optional(),
  baseAmount: z.coerce.number().min(0, "Amount must be a positive number"),
});

export type FeeTemplateSchema = z.infer<typeof feeTemplateSchema>;