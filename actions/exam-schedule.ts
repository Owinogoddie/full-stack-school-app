'use server'

import prisma from "@/lib/prisma";
import { EXamScheduleSchema } from "@/schemas/exam-schedule-schema";
type ResponseState = {
    success: boolean;
    error: boolean;
    message?: string;
    messages?: string[];
  };
  export const createExamSchedule = async (data: EXamScheduleSchema): Promise<ResponseState> => {
    try {
      // Convert startTime and endTime (HH:MM) to full ISO-8601 DateTime
      const startTimeISO = new Date(
        `${data.date.toISOString().split('T')[0]}T${data.startTime}:00`
      ).toISOString();
  
      const endTimeISO = new Date(
        `${data.date.toISOString().split('T')[0]}T${data.endTime}:00`
      ).toISOString();
  
      await prisma.examSchedule.create({
        data: {
          examId: data.examId,
          subjectId: data.subjectId,
          date: data.date, // Date is already ISO-8601
          startTime: startTimeISO, // Now in ISO-8601
          endTime: endTimeISO, // Now in ISO-8601
          venue: data.venue,
        },
      });
  
      return { success: true, error: false, message: "Exam schedule created successfully" };
    } catch (err) {
      console.error(err);
      return { success: false, error: true, message: "Failed to create exam schedule" };
    }
  };
  
  export const updateExamSchedule = async (data: EXamScheduleSchema): Promise<ResponseState> => {
    try {
      if (!data.id) {
        throw new Error("Exam schedule ID is required for update");
      }
  
      // Convert startTime and endTime (HH:MM) to full ISO-8601 DateTime
      const startTimeISO = new Date(
        `${data.date.toISOString().split('T')[0]}T${data.startTime}:00`
      ).toISOString();
  
      const endTimeISO = new Date(
        `${data.date.toISOString().split('T')[0]}T${data.endTime}:00`
      ).toISOString();
  
      await prisma.examSchedule.update({
        where: { id: data.id },
        data: {
          examId: data.examId,
          subjectId: data.subjectId,
          date: data.date, // Date is already in ISO-8601
          startTime: startTimeISO, // Now in ISO-8601
          endTime: endTimeISO, // Now in ISO-8601
          venue: data.venue,
        },
      });
  
      return { success: true, error: false, message: "Exam schedule updated successfully" };
    } catch (err) {
      console.error(err);
      return { success: false, error: true, message: "Failed to update exam schedule" };
    }
  };
  
  
  export const deleteExamSchedule = async (currentState: ResponseState, formData: FormData): Promise<ResponseState> => {
    const id = formData.get('id');
    try {
      await prisma.examSchedule.delete({
        where: {
          id: Number(id),
        },
      });
      return { success: true, error: false, message: "Exam schedule deleted successfully" };
    } catch (err) {
      console.error(err);
      return { success: false, error: true, message: "Failed to delete exam schedule" };
    }
  };