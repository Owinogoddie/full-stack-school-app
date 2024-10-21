// schemas/special-programme-schema.ts
import { z } from "zod";

export const specialProgrammeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
//   schoolId: z.string().optional(),
  grades: z.array(z.number()).optional(), 
  classes: z.array(z.number()).optional(),
  students: z.array(z.string()).optional(),
});

export type SpecialProgrammeSchema = z.infer<typeof specialProgrammeSchema>;