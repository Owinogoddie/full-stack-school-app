import { z } from "zod";

export const assignmentSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "Title is required!"),
  startDate: z.coerce.date({ message: "Start date is required!" }),
  dueDate: z.coerce.date({ message: "Due date is required!" }),
  lessonId: z.number(),
});

export type AssignmentSchema = z.infer<typeof assignmentSchema>;
