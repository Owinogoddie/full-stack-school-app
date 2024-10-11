import { z } from "zod";

// Define AttendanceStatus Enum
export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LATE = "LATE",
  EXCUSED = "EXCUSED",
}

// Modify the schema to use AttendanceStatus instead of present
export const attendanceSchema = z.object({
  id: z.number().optional(),
  date: z.coerce.date({ message: "Date is required!" }),

  classId: z.string(),
  
  // studentId: z.string(),
  // lessonId: z.number(),
  students: z.array(
    z.object({
      id: z.string(),
      status: z.enum([AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.LATE, AttendanceStatus.EXCUSED], { message: "Invalid status!" }), // Use enum for status
    })
  ),
});

// Export type definition
export type AttendanceSchema = z.infer<typeof attendanceSchema>;
