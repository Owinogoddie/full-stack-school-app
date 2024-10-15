import { z } from "zod";

export const termSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Term name is required"),
  startDate: z.coerce.date({ required_error: "Start date is required" }),
  endDate: z.coerce.date({ required_error: "End date is required" }),
  academicYearId: z.number({ required_error: "Academic Year is required" }),
});

export type TermSchema = z.infer<typeof termSchema>;