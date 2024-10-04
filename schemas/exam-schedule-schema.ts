import {z} from 'zod'
const timeString = z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
  message: "Invalid time format. Use HH:MM format",
});
export const examScheduleSchema = z.object({
  id: z.number().optional(),
  examId: z.coerce.number(), // Coerces to number
  subjectId: z.coerce.number(), // Coerces to number
  date: z.coerce.date({ message: "date is required!" }),
  startTime: timeString, // Validates time string in "HH:MM" format
  endTime: timeString,   // Validates time string in "HH:MM" format
  venue: z.string().nullable().optional(),
});
  
export type EXamScheduleSchema = z.infer<typeof examScheduleSchema>;