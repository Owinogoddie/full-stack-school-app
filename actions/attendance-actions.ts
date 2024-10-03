"use server";

import prisma from "@/lib/prisma";
import { AttendanceSchema } from "@/schemas/attendance-schema";

// Type definition for current state
type CurrentState = { success: boolean; error: boolean };

// CREATE Attendance
export const createAttendance = async (
  currentState: CurrentState,
  data: AttendanceSchema
) => {
  try {
    await prisma.attendance.create({
      data: {
        date: data.date,
        status: data.status, // Assuming 'present' refers to status, map it accordingly
        studentId: data.studentId,
        lessonId: data.lessonId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating attendance: ", err);
    return { success: false, error: true };
  }
};

// UPDATE Attendance
export const updateAttendance = async (
  currentState: CurrentState,
  data: AttendanceSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }

  try {
    await prisma.attendance.update({
      where: {
        id: data.id,
      },
      data: {
        date: data.date,
        status: data.status, // Update attendance status (like "present" or any other status)
        studentId: data.studentId,
        lessonId: data.lessonId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating attendance: ", err);
    return { success: false, error: true };
  }
};

// DELETE Attendance
export const deleteAttendance = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    await prisma.attendance.delete({
      where: {
        id: parseInt(id), // Ensure ID is parsed as an integer
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting attendance: ", err);
    return { success: false, error: true };
  }
};
