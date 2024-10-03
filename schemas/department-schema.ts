import { z } from "zod";

export const departmentSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Department name is required"),
  description: z.string().optional(),
  headTeacherId: z.string().optional().nullable(),
  schoolId: z.string().optional().nullable(),
});

export type DepartmentSchema = z.infer<typeof departmentSchema>;