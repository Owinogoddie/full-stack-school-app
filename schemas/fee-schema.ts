// schemas/fee-template-schema.ts
import { z } from "zod";

export const feeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  amount: z.coerce.number().min(0, "Amount must be a positive number"),
  termId: z.string().optional(),
  academicYearId: z.coerce.number().optional(),
  feeTemplateId: z.string(),
  gradeIds: z.array(z.number()).optional(),
  classIds: z.array(z.string()).optional(),
  studentCategoryIds: z.array(z.string()).optional(),
  specialProgrammeIds: z.array(z.string()).optional(),
//   baseAmount: z.coerce.number().min(0, "Base amount must be a positive number"),
});

export type FeeSchema = z.infer<typeof feeSchema>;