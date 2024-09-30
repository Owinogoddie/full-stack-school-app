import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const lessonSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Lesson name is required!"),
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]),
  startTime: z.string().regex(timeRegex, "Invalid time format. Use HH:MM"),
  endTime: z.string().regex(timeRegex, "Invalid time format. Use HH:MM"),
  subjectId: z.coerce.number(),
  classId: z.coerce.number(),
  teacherId: z.string(),
});

export type LessonSchema = z.infer<typeof lessonSchema>;