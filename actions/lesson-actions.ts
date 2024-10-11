'use server';

import prisma from "@/lib/prisma";
import { LessonSchema } from "@/schemas/lesson-schema";
import { Prisma } from "@prisma/client";
import moment from "moment";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

export const createLesson = async (data: LessonSchema): Promise<ResponseState> => {
  try {
        // Convert start and end times to Date objects in UTC
        
    const startTime = moment.utc(data.startTime, "HH:mm").toDate();
    const endTime = moment.utc(data.endTime, "HH:mm").toDate();

    // Check for overlapping lessons
    const existingLessons = await prisma.lesson.findMany({
      where: {
        classId: data.classId,
        day: data.day,
        OR: [
          {
            startTime: {
              gte: startTime,
            },
            endTime: {
              lte: endTime,
            },
          },
          {
            startTime: {
              lte: endTime,
            },
            endTime: {
              gte: startTime,
            },
          },
        ],
      },
    });

    if (existingLessons.length > 0) {
      return {
        success: false,
        error: true,
        message: "A lesson already exists in this time range for the selected class. Please choose a different time.",
      };
    }

    await prisma.lesson.create({
      data: {
        name: data.name,
        day: data.day,
        startTime: startTime,
        endTime: endTime,
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
      },
    });
    return { success: true, error: false, message: "Lesson created successfully" };
  } catch (err) {
    console.error(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return {
          success: false,
          error: true,
          message: "A lesson with these details already exists. Please modify the lesson data.",
        };
      }
    }
    return { success: false, error: true, message: "Failed to create lesson. Please try again." };
  }
};

export const updateLesson = async (data: LessonSchema): Promise<ResponseState> => {
  try {
    if (!data.id) {
      throw new Error("Lesson ID is required for update");
    }

    const startTime = moment.utc(data.startTime, "HH:mm").toDate();
    const endTime = moment.utc(data.endTime, "HH:mm").toDate();

    const existingLessons = await prisma.lesson.findMany({
      where: {
        classId: data.classId,
        day: data.day,
        id: {
          not: data.id,
        },
        OR: [
          {
            startTime: {
              gte: startTime,
            },
            endTime: {
              lte: endTime,
            },
          },
          {
            startTime: {
              lte: endTime,
            },
            endTime: {
              gte: startTime,
            },
          },
        ],
      },
    });

    if (existingLessons.length > 0) {
      return {
        success: false,
        error: true,
        message: "A lesson already exists in this time range for the selected class. Please choose a different time.",
      };
    }

    await prisma.lesson.update({
      where: { id: data.id },
      data: {
        name: data.name,
        day: data.day,
        startTime: startTime,
        endTime: endTime,
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
      },
    });
    return { success: true, error: false, message: "Lesson updated successfully" };
  } catch (err) {
    console.error(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return {
          success: false,
          error: true,
          message: "A lesson with these details already exists. Please modify the lesson data.",
        };
      }
    }
    return { success: false, error: true, message: "Failed to update lesson. Please try again." };
  }
};

export const deleteLesson = async (
  prevState: ResponseState,
  formData: FormData
): Promise<ResponseState> => {
  const id = formData.get("id") as string;

  try {
    await prisma.lesson.delete({
      where: {
        id: parseInt(id, 10),
      },
    });

    return { success: true, error: false, message: "Lesson deleted successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to delete lesson." };
  }
};
