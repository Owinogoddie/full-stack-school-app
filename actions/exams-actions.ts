"use server"

import { ExamSchema } from "@/schemas/exam-schema";
type CurrentState = { success: boolean; error: boolean };

export const createExam = async (
    currentState: CurrentState,
    data: ExamSchema
  ) => {
    // const { userId, sessionClaims } = auth();
    // const role = (sessionClaims?.metadata as { role?: string })?.role;
  
    try {
      // if (role === "teacher") {
      //   const teacherLesson = await prisma.lesson.findFirst({
      //     where: {
      //       teacherId: userId!,
      //       id: data.lessonId,
      //     },
      //   });
  
      //   if (!teacherLesson) {
      //     return { success: false, error: true };
      //   }
      // }
  
      await prisma.exam.create({
        data: {
          title: data.title,
          startTime: data.startTime,
          endTime: data.endTime,
          lessonId: data.lessonId,
        },
      });
  
      // revalidatePath("/list/subjects");
      return { success: true, error: false };
    } catch (err) {
      console.log(err);
      return { success: false, error: true };
    }
  };
  
  export const updateExam = async (
    currentState: CurrentState,
    data: ExamSchema
  ) => {
    // const { userId, sessionClaims } = auth();
    // const role = (sessionClaims?.metadata as { role?: string })?.role;
  
    try {
      // if (role === "teacher") {
      //   const teacherLesson = await prisma.lesson.findFirst({
      //     where: {
      //       teacherId: userId!,
      //       id: data.lessonId,
      //     },
      //   });
  
      //   if (!teacherLesson) {
      //     return { success: false, error: true };
      //   }
      // }
  
      await prisma.exam.update({
        where: {
          id: data.id,
        },
        data: {
          title: data.title,
          startTime: data.startTime,
          endTime: data.endTime,
          lessonId: data.lessonId,
        },
      });
  
      // revalidatePath("/list/subjects");
      return { success: true, error: false };
    } catch (err) {
      console.log(err);
      return { success: false, error: true };
    }
  };
  
  export const deleteExam = async (
    currentState: CurrentState,
    data: FormData
  ) => {
    const id = data.get("id") as string;
  
    // const { userId, sessionClaims } = auth();
    // const role = (sessionClaims?.metadata as { role?: string })?.role;
  
    try {
      await prisma.exam.delete({
        where: {
          id: parseInt(id),
          // ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
        },
      });
  
      // revalidatePath("/list/subjects");
      return { success: true, error: false };
    } catch (err) {
      console.log(err);
      return { success: false, error: true };
    }
  };