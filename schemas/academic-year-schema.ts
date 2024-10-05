import { z } from "zod";

export const academicYearSchema = z.object({
  id: z.number().optional(), // Required for update
  year: z.string().min(5, "Year must be at least 5 characters long"), // e.g., "2023-2024"
  startDate: z.coerce.date({ required_error: "Start date is required" }),
  endDate: z.coerce.date({ required_error: "End date is required" }),
  currentAcademicYear: z.boolean().default(false), // New field with default value
});

export type AcademicYearSchema = z.infer<typeof academicYearSchema>;
