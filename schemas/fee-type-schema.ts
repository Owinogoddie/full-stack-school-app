// schemas/fee-type-schema.ts
import { z } from "zod";

export const feeTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters long"),
  description: z.string().optional(),

  amount: z.coerce.number().min(0, "Amount must be a positive number"),
});

export type FeeTypeSchema = z.infer<typeof feeTypeSchema>;