"use server";

import prisma from "@/lib/prisma";
import { StudentSchema } from "@/schemas/student-schema";
import { clerkClient } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

export const createStudent = async (
  data: StudentSchema
): Promise<ResponseState> => {
  let user;
  try {
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true, message: "Class capacity reached." };
    }

    user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "student" },
    });

    await prisma.student.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });

    return { success: true, error: false, message: "Student created successfully." };
  } catch (err: any) {
    console.error("Error in createStudent: ", err);

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

export const updateStudent = async (
  data: StudentSchema
): Promise<ResponseState> => {
  if (!data.id) {
    return { success: false, error: true, message: "Student ID is required for update." };
  }
  
  try {
    await prisma.student.update({
      where: { id: data.id },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });

    return { success: true, error: false, message: "Student updated successfully." };
  } catch (err: any) {
    console.error("Error in updateStudent: ", err);
    
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

export const deleteStudent = async (
  prevState: ResponseState,
  formData: FormData
): Promise<ResponseState> => {
  const id = formData.get('id') as string;
  if (!id) {
    return { success: false, error: true, message: "Student ID is required for deletion." };
  }
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.student.delete({
      where: {
        id: id,
      },
    });

    return { success: true, error: false, message: "Student deleted successfully." };
  } catch (err: any) {
    console.error("Error in deleteStudent: ", err);

    // If Prisma or Clerk error has `errors`, return all error messages
    if (err.errors) {
      const errorMessages = err.errors.map((e: any) => e.message);
      return { success: false, error: true, messages: errorMessages };
    }

    // Handle Prisma known errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return { success: false, error: true, message: "Student not found." };
      }
    }

    return { success: false, error: true, message: err.message || "An error occurred during deletion." };
  }
};

