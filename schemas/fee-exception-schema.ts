// schemas/fee-exception-schema.ts
import { z } from "zod";

const EXCEPTION_TYPES = z.enum([
  'DISCOUNT',
  'SCHOLARSHIP',
  'WAIVER',
  'ADJUSTMENT',
  'DISABILITY_SUPPORT',
  'FINANCIAL_AID'
]);

const EXCEPTION_STATUS = z.enum([
  'ACTIVE',
  'EXPIRED',
  'PENDING',
  'REJECTED',
  'APPROVED',
  'SUSPENDED'
]);

const AMOUNT_TYPE = z.enum(['FIXED', 'PERCENTAGE']);

export const feeExceptionSchema = z.object({
  id: z.string().optional(),
  studentId: z.string(),
  feeTemplateId: z.string(),
  exceptionType: EXCEPTION_TYPES,
  amountType: AMOUNT_TYPE,
  amount: z.coerce.number().optional(),
  percentage: z.coerce.number().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  description: z.string().optional(),
  approvedBy: z.string().optional(),
  reason: z.string().optional(),
  status: EXCEPTION_STATUS.default('ACTIVE'),
});

export type FeeExceptionSchema = z.infer<typeof feeExceptionSchema>;