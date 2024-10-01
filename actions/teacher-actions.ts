"use server"

import prisma from "@/lib/prisma";
import { TeacherSchema } from "@/schemas/teacher-schema";
import { clerkClient } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

export const createTeacher = async (formData: TeacherSchema): Promise<ResponseState> => {
  let user;
  if (!formData.password) {
    return { success: false, error: true, message: "Password is required for update." };
  }
  try {
    // Create user in Clerk
    user = await clerkClient.users.createUser({
      username: formData.username,
      password: formData.password,
      firstName: formData.name,
      lastName: formData.surname,
      publicMetadata: { role: "teacher" },
    });

    // Create teacher in Prisma
    await prisma.teacher.create({
      data: {
        id: user.id,
        username: formData.username,
        name: formData.name,
        surname: formData.surname,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address,
        img: formData.img || null,
        bloodType: formData.bloodType,
        sex: formData.sex,
        birthday: formData.birthday,
        subjects: {
          connect: formData.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Error in createTeacher: ", err);

    // Rollback Clerk user creation if Prisma fails
    if (user) {
      await clerkClient.users.deleteUser(user.id);
    }

    // If Prisma or Clerk error has `errors`, return all error messages
    if (err.errors) {
      const errorMessages = err.errors.map((e: any) => e.message);
      return { success: false, error: true, messages: errorMessages };
    }

    // Handle Prisma known errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        const targetField = err.meta?.target;
        return { success: false, error: true, message: `The ${targetField} is already in use. Please try another.` };
      }
    }

    return { success: false, error: true, message: err.message || "An error occurred during creation." };
  }
};

export const updateTeacher = async (formData: any): Promise<ResponseState> => {
  if (!formData.id) {
    return { success: false, error: true, message: "Teacher ID is required for update." };
  }
  
  let originalTeacher;
  try {
    console.log('updating')
    // Fetch original teacher data for potential rollback
    originalTeacher = await prisma.teacher.findUnique({
      where: { id: formData.id },
      include: { subjects: true },
    });

    if (!originalTeacher) {
      return { success: false, error: true, message: "Teacher not found." };
    }

    // Update user in Clerk
    await clerkClient.users.updateUser(formData.id, {
      username: formData.username,
      firstName: formData.name,
      lastName: formData.surname,
    });

    // Update teacher in Prisma
    await prisma.teacher.update({
      where: {
        id: formData.id,
      },
      data: {
        username: formData.username,
        name: formData.name,
        surname: formData.surname,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address,
        img: formData.img || null,
        bloodType: formData.bloodType,
        sex: formData.sex,
        birthday: formData.birthday,
        subjects: {
          set: formData.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Error in updateTeacher: ", err);

    // Rollback Prisma changes
    if (originalTeacher) {
      try {
        await prisma.teacher.update({
          where: { id: formData.id },
          data: {
            ...originalTeacher,
            subjects: {
              set: originalTeacher.subjects.map(subject => ({ id: subject.id })),
            },
          },
        });

        // Rollback Clerk changes
        await clerkClient.users.updateUser(formData.id, {
          username: originalTeacher.username,
          firstName: originalTeacher.name,
          lastName: originalTeacher.surname,
        });
      } catch (rollbackErr) {
        console.error("Error during rollback: ", rollbackErr);
      }
    }

    // If Prisma or Clerk error has `errors`, return all error messages
    if (err.errors) {
      const errorMessages = err.errors.map((e: any) => e.message);
      return { success: false, error: true, messages: errorMessages };
    }

    // Handle Prisma known errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        const targetField = err.meta?.target;
        return { success: false, error: true, message: `The ${targetField} is already in use. Please try another.` };
      }
    }

    return { success: false, error: true, message: err.message || "An error occurred during update." };
  }
};

export const deleteTeacher = async (
  prevState: ResponseState,
  formData: FormData
): Promise<ResponseState> => {
  const id = formData.get('id') as string;
  if (!id) {
    return { success: false, error: true, message: "Teacher ID is required for deletion." };
  }
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.teacher.delete({
      where: {
        id: id,
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Error in deleteTeacher: ", err);

    // If Prisma or Clerk error has `errors`, return all error messages
    if (err.errors) {
      const errorMessages = err.errors.map((e: any) => e.message);
      return { success: false, error: true, messages: errorMessages };
    }

    // Handle Prisma known errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return { success: false, error: true, message: "Teacher not found." };
      }
    }

    return { success: false, error: true, message: err.message || "An error occurred during deletion." };
  }
};