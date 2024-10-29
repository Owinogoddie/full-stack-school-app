"use server";

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
export const createTeacher = async (
  formData: TeacherSchema
): Promise<ResponseState> => {
  let user;
  if (!formData.password) {
    return {
      success: false,
      error: true,
      message: "Password is required for creation.",
    };
  }
  try {
    // const email = formData.email || ""; // Ensure email is not undefined
    // const username = email.split("@")[0]; // Take the part before the '@'
    // Create user in Clerk
    user = await clerkClient.users.createUser({
      username:formData.userName,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      publicMetadata: { role: "teacher" },
    });

    // Create teacher in Prisma
    await prisma.teacher.create({
      data: {
        id: user.id,
        userName:formData.userName,
        tscNumber: formData.tscNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: new Date(formData.dateOfBirth),
        gender: formData.gender,
        nationalId: formData.nationalId,
        email: formData.email || "",
        phone: formData.phone,
        address: formData.address,
        qualifications: formData.qualifications,
        specializations: formData.specializations,
        employmentStatus: formData.employmentStatus,
        hireDate: new Date(formData.hireDate),
        subjects: {
          connect: formData.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
        school: formData.schoolId
          ? { connect: { id: formData.schoolId.toString() } }
          : undefined,
        department: formData.departmentId
          ? { connect: { id: formData.departmentId } }
          : undefined,
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Error in createTeacher: ", err);

    // Rollback Clerk user creation if Prisma fails
    if (user) {
      try {
        await clerkClient.users.deleteUser(user.id);
      } catch (rollbackErr) {
        console.error("Error during rollback:", rollbackErr);
      }
    }
     // Handle Clerk-specific errors
     if (err.clerkError) {
      if (err.errors?.[0]?.code === 'form_password_pwned') {
        return {
          success: false,
          error: true,
          message: "Password has been found in an online data breach. Please use a different password."
        };
      }

      if (err.errors?.[0]?.code === 'form_identifier_exists') {
        return {
          success: false,
          error: true,
          message: "Username is already taken. Please choose another username."
        };
      }

      if (err.errors && err.errors.length > 0) {
        return {
          success: false,
          error: true,
          message: err.errors[0].message,
          messages: err.errors.map((e: any) => e.message)
        };
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
        return {
          success: false,
          error: true,
          message: `The ${targetField} is already in use. Please try another.`,
        };
      }
    }

    return {
      success: false,
      error: true,
      message: err.message || "An error occurred during creation.",
    };
  }
};

export const updateTeacher = async (formData: any): Promise<ResponseState> => {
  if (!formData.id) {
    return {
      success: false,
      error: true,
      message: "Teacher ID is required for update.",
    };
  }

  let originalTeacher;
  try {
    // console.log("updating");
    // Fetch original teacher data for potential rollback
    originalTeacher = await prisma.teacher.findUnique({
      where: { id: formData.id },
      include: { subjects: true, school: true, department: true },
    });

    if (!originalTeacher) {
      return { success: false, error: true, message: "Teacher not found." };
    }

    // Prepare Clerk update data
    const clerkUpdateData: any = {
      username: formData.userName,
      firstName: formData.firstName,
      lastName: formData.lastName,
    };

    // Add password to Clerk update only if provided
    if (formData.password) {
      clerkUpdateData.password = formData.password;
    }

    // Update user in Clerk
    await clerkClient.users.updateUser(formData.id, clerkUpdateData);

    // Update teacher in Prisma
    await prisma.teacher.update({
      where: {
        id: formData.id,
      },
      data: {
        tscNumber: formData.tscNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
        userName:formData.userName,
        dateOfBirth: new Date(formData.dateOfBirth),
        gender: formData.gender,
        nationalId: formData.nationalId,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        qualifications: formData.qualifications,
        specializations: formData.specializations,
        employmentStatus: formData.employmentStatus,
        hireDate: new Date(formData.hireDate),
        subjects: {
          set: formData.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
        school: formData.schoolId
          ? { connect: { id: formData.schoolId } }
          : formData.schoolId === null
          ? { disconnect: true }
          : undefined,
        department: formData.departmentId
          ? { connect: { id: parseInt(formData.departmentId) } }
          : formData.departmentId === null
          ? { disconnect: true }
          : undefined,
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Error in updateTeacher: ", err);
 // Handle Clerk-specific errors
 if (err.clerkError) {
  // Check if it's a password breach error
  if (err.errors?.[0]?.code === 'form_password_pwned') {
    return {
      success: false,
      error: true,
      message: "Password has been found in an online data breach. Please use a different password."
    };
  }

  // Handle username exists error
  if (err.errors?.[0]?.code === 'form_identifier_exists') {
    return {
      success: false,
      error: true,
      message: "Username is already taken. Please choose another username."
    };
  }

  // Handle any other Clerk errors by returning their specific messages
  if (err.errors && err.errors.length > 0) {
    return {
      success: false,
      error: true,
      message: err.errors[0].message,
      messages: err.errors.map((e: any) => e.message)
    };
  }
}
    // Rollback Prisma changes
    if (originalTeacher) {
      try {
        await prisma.teacher.update({
          where: { id: formData.id },
          data: {
            tscNumber: originalTeacher.tscNumber,
            firstName: originalTeacher.firstName,
            lastName: originalTeacher.lastName,
            userName: originalTeacher.userName,
            dateOfBirth: originalTeacher.dateOfBirth,
            gender: originalTeacher.gender,
            nationalId: originalTeacher.nationalId,
            email: originalTeacher.email,
            phone: originalTeacher.phone,
            address: originalTeacher.address,
            qualifications: originalTeacher.qualifications,
            specializations: originalTeacher.specializations,
            employmentStatus: originalTeacher.employmentStatus,
            hireDate: originalTeacher.hireDate,
            subjects: {
              set: originalTeacher.subjects.map((subject) => ({
                id: subject.id,
              })),
            },
            school: originalTeacher.school
              ? { connect: { id: originalTeacher.school.id } }
              : { disconnect: true },
            department: originalTeacher.department
              ? { connect: { id: originalTeacher.department.id } }
              : { disconnect: true },
          },
        });

        // Rollback Clerk changes
        await clerkClient.users.updateUser(formData.id, {
          username: originalTeacher.userName,
          firstName: originalTeacher.firstName,
          lastName: originalTeacher.lastName,
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
        return {
          success: false,
          error: true,
          message: `The ${targetField} is already in use. Please try another.`,
        };
      }
    }

    return {
      success: false,
      error: true,
      message: err.message || "An error occurred during update.",
    };
  }
};

export const deleteTeacher = async (
  prevState: ResponseState,
  formData: FormData
): Promise<ResponseState> => {
  const id = formData.get("id") as string;
  if (!id) {
    return {
      success: false,
      error: true,
      message: "Teacher ID is required for deletion.",
    };
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

    return {
      success: false,
      error: true,
      message: err.message || "An error occurred during deletion.",
    };
  }
};
