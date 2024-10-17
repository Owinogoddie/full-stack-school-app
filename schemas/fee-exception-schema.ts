import { z } from "zod";

export const feeExceptionSchema = z.object({
  id: z.string().optional(),
  feeTemplateId: z.string(),
  studentId: z.string(),
  type: z.enum(['DISCOUNT', 'SCHOLARSHIP', 'WAIVER', 'ADJUSTMENT']),
  adjustmentType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  adjustmentValue: z.number(),
  reason: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  approvedBy: z.string(),
  documents: z.array(z.string()).optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'CANCELLED']).default('ACTIVE'),
});


export type FeeExceptionSchema = z.infer<typeof feeExceptionSchema>;