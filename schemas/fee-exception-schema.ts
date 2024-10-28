// schemas/fee-exception-schema.ts
import { z } from "zod";

export const feeExceptionSchema = z.object({
  id: z.string().optional(),
  studentId: z.string({
    required_error: "Student is required",
  }),
  feeStructureId: z.string({
    required_error: "Fee structure is required",
  }),
  amount: z.coerce.number({
    required_error: "Amount is required",
  }).min(0, "Amount must be greater than 0"),
  reason: z.string({
    required_error: "Reason is required",
  }).min(1, "Reason cannot be empty"),
  startDate: z.coerce.date({
    required_error: "Start date is required",
  }),
  endDate: z.coerce.date().optional(),
  isActive: z.boolean().default(true),
});

export type FeeExceptionSchema = z.infer<typeof feeExceptionSchema>