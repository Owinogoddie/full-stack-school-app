"use server";

import prisma from "@/lib/prisma";
import { AttendanceSchema } from "@/schemas/attendance-schema";
import { AttendanceStatus } from "@prisma/client";

type CurrentState = { success: boolean; error: boolean };

export const createAttendance = async (
  currentState: CurrentState,
  data: AttendanceSchema
) => {
  try {
    // Create an attendance record for each student
    const createdAttendances = await Promise.all(
      data.students.map(async (student) => {
        return prisma.attendance.create({
          data: {
            date: data.date,
            status: student.status as AttendanceStatus,
            student: { connect: { id: student.id } },
            class: { connect: { id: parseInt(data.classId) } },
          },
        });
      })
    );
    console.log(createdAttendances)

    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating attendance: ", err);
    return { success: false, error: true };
  }
};

export const updateAttendance = async (
  currentState: CurrentState,
  data: AttendanceSchema
) => {
  try {
    // Update attendance records for each student
    const updatedAttendances = await Promise.all(
      data.students.map(async (student) => {
        return prisma.attendance.upsert({
          where: {
            date_studentId: {
              date: data.date,
              studentId: student.id,
            },
          },
          update: {
            status: student.status as AttendanceStatus,
            class: { connect: { id: parseInt(data.classId) } },
          },
          create: {
            date: data.date,
            status: student.status as AttendanceStatus,
            student: { connect: { id: student.id } },
            class: { connect: { id: parseInt(data.classId) } },
          },
        });
      })
    );
console.log(updatedAttendances)
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating attendance: ", err);
    return { success: false, error: true };
  }
};

export const deleteAttendance = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    await prisma.attendance.delete({
      where: {
        id: parseInt(id),
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting attendance: ", err);
    return { success: false, error: true };
  }
};