import { z } from "zod";

export const attendanceSchema = z.object({
  id: z.number().optional(),
  date: z.coerce.date({ message: "Date is required!" }),
  present: z.boolean(),
  studentId: z.string(),
  lessonId: z.number(),
});

export type AttendanceSchema = z.infer<typeof attendanceSchema>;
