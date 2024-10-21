import { z } from "zod";

const termSchema = z.object({
  name: z.string().min(1, "Term name is required"),
  startDate: z.coerce.date({ required_error: "Term start date is required" }),
  endDate: z.coerce.date({ required_error: "Term end date is required" }),
});

export const academicYearSchema = z.object({
  id: z.number().optional(),
  year: z.string().min(4, "Year must be at least 4 characters long"),
  startDate: z.coerce.date({ required_error: "Start date is required" }),
  endDate: z.coerce.date({ required_error: "End date is required" }),
  currentAcademicYear: z.boolean().default(false),
  terms: z.array(termSchema).min(1, "At least one term is required"),
});

export type AcademicYearSchema = z.infer<typeof academicYearSchema>;