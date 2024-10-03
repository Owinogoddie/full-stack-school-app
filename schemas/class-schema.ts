import { z } from "zod";

export const classSchema = z.object({
  id: z.coerce.number().optional(), // Optional because it can be auto-generated
  name: z.string().min(1, { message: "Class name is required!" }), // Required class name
  capacity: z.coerce.number().min(1, { message: "Capacity must be at least 1!" }), // Minimum capacity
  schedule: z.any().optional(), // Optional JSON schedule
  gradeId: z.coerce.number().min(1, { message: "Grade ID is required!" }), // Required grade ID
  schoolId: z.coerce.string().optional(), // Optional school ID
  supervisorId: z.coerce.string().optional() // Optional teacher ID
});

export type ClassSchema = z.infer<typeof classSchema>;
