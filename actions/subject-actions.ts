'use server'
import prisma from "@/lib/prisma";
import { SubjectSchema } from "@/schemas/subject-schema";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

export const createSubject = async (data: SubjectSchema): Promise<ResponseState> => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description || "",
      },
    });
    return { success: true, error: false, message: "Subject created successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to create subject" };
  }
};

export const updateSubject = async (data: SubjectSchema): Promise<ResponseState> => {
  try {
    if (!data.id) {
      throw new Error("Subject ID is required for update");
    }
    await prisma.subject.update({
      where: { id: data.id },
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
      },
    });
    return { success: true, error: false, message: "Subject updated successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to update subject" };
  }
};

export const deleteSubject = async (currentState: ResponseState, formData: FormData): Promise<ResponseState> => {
  const id = formData.get('id');
  try {
    await prisma.subject.delete({
      where: {
        id: Number(id),
      },
    });
    return { success: true, error: false, message: "Subject deleted successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to delete Subject" };
  }
};