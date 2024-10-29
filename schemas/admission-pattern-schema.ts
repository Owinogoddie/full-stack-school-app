// schemas/admission-number-schema.ts
import { z } from "zod";

export const AdmissionNumberPatternSchema = z.object({
  id: z.coerce.number().optional(),
  prefix: z
    .string()
    .min(1, "Prefix is required")
    .max(10, "Prefix must not exceed 10 characters")
    .regex(/^[A-Za-z]+$/, "Prefix must contain only letters"),
  yearFormat: z
    .enum(["YY", "YYYY"], {
      required_error: "Year format must be either 'YY' or 'YYYY'",
    }),
  digitCount: z
  .coerce
    .number()
    .int()
    .min(1, "Digit count must be at least 1")
    .max(6, "Digit count must not exceed 6"),
  separator: z
    .string()
    .max(1, "Separator must be a single character")
    .regex(/^[/\-_.]?$/, "Separator must be one of: / - _ .")
    .optional()
    .nullable(),
  lastNumber: z
  .coerce
    .number()
    .int()
    .min(0, "Last number must be non-negative"),
  schoolId: z.string().optional(),
});

export type AdmissionNumberPatternSchema = z.infer<typeof AdmissionNumberPatternSchema>;
