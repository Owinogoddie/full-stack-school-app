"use server";

import prisma from "@/lib/prisma";
import { StudentSchema } from "@/schemas/student-schema";
import { Prisma } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs/server";
import { getCurrentAcademicYear } from "@/lib/academic-year-util";
import { generateNewAdmNumber } from "@/utils/generate-admission-number";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

export const createStudent = async (
  data: StudentSchema
): Promise<ResponseState> => {
  let user: any;
  if (!data.password) {
    return {
      success: false,
      error: true,
      message: "Password is required for creation.",
    };
  }
  try {
    // const admissionNumber = await generateAdmissionNumber();
    const currentAcademicYear = await getCurrentAcademicYear();
    // Create user in Clerk
    // const username = `${data.firstName}${data.lastName}`.toLowerCase();
    user = await clerkClient.users.createUser({
      username: data.userName,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      publicMetadata: { role: "student" },
    });

    // Create student and enrollment in Prisma
    await prisma.$transaction(async (prisma) => {
      // Get the admission pattern without schoolId filter
      const admissionPattern = await prisma.admissionNumberPattern.findFirst();

      if (!admissionPattern) {
        throw new Error("No admission pattern found");
      }
      const { newLastNumber } = await generateNewAdmNumber({
        prefix: admissionPattern.prefix,
        yearFormat: admissionPattern.yearFormat,
        digitCount: admissionPattern.digitCount,
        // separator: admissionPattern.separator,
        lastNumber: admissionPattern.lastNumber,
      });
      await prisma.admissionNumberPattern.update({
        where: { id: admissionPattern.id },
        data: { lastNumber: newLastNumber },
      });
      const student = await prisma.student.create({
        data: {
          id: user.id,
          upi: data.upi,
          admissionNumber:data.admissionNumber || "",
          firstName: data.firstName,
          userName: data.userName,
          lastName: data.lastName,
          dateOfBirth: new Date(data.dateOfBirth),
          gender: data.gender,
          address: data.address,
          classId: data.classId,
          gradeId: data.gradeId,
          schoolId: data.schoolId,
          parentId: data.parentId,
          enrollmentDate: new Date(data.enrollmentDate),
          medicalInfo: data.medicalInfo,
          specialNeeds: data.specialNeeds,
          img: data.img || null,
          currentAcademicYearId: currentAcademicYear.id,
          studentCategories: {
            connect: data.studentCategories?.map((id) => ({ id })) || [],
          },
        },
      });

      // Create enrollment
      await prisma.enrollment.create({
        data: {
          studentId: student.id,
          gradeId: data.gradeId,
          academicYearId: currentAcademicYear.id,
          classId: data.classId,
          schoolId: data.schoolId,
          enrollmentDate: new Date(data.enrollmentDate),
        },
      });
    });

    return {
      success: true,
      error: false,
      message: "Student created successfully with enrollment.",
    };
  } catch (err: any) {
    console.error("Error in createStudent: ", err);

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
      if (err.errors?.[0]?.code === "form_password_pwned") {
        return {
          success: false,
          error: true,
          message:
            "Password has been found in an online data breach. Please use a different password.",
        };
      }

      if (err.errors?.[0]?.code === "form_identifier_exists") {
        return {
          success: false,
          error: true,
          message: "Username is already taken. Please choose another username.",
        };
      }

      if (err.errors && err.errors.length > 0) {
        return {
          success: false,
          error: true,
          message: err.errors[0].message,
          messages: err.errors.map((e: any) => e.message),
        };
      }
    }

    // If Prisma or Clerk error has `errors`, return all error messages
    if (err.errors) {
      const errorMessages = err.errors.map((e: any) => e.message);
      return { success: false, error: true, messages: errorMessages };
    }

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

export const updateStudent = async (data: any): Promise<ResponseState> => {
  console.log(data);
  if (!data.id) {
    return {
      success: false,
      error: true,
      message: "Student ID is required for update.",
    };
  }

  let originalStudent: any;
  try {
    // Fetch original student data for potential rollback
    originalStudent = await prisma.student.findUnique({
      where: { id: data.id },
      include: {
        enrollments: { orderBy: { createdAt: "desc" }, take: 1 },
        studentCategories: true,
      },
    });

    if (!originalStudent) {
      return { success: false, error: true, message: "Student not found." };
    }

    const clerkUpdateData: any = {
      username: data.userName,
      firstName: data.firstName,
      lastName: data.lastName,
    };

    if (data.password) {
      clerkUpdateData.password = data.password;
    }

    await clerkClient.users.updateUser(data.id, clerkUpdateData);

    // Update student and create new enrollment if academic year changed
    await prisma.$transaction(async (prisma) => {
      await prisma.student.update({
        where: { id: data.id },
        data: {
          upi: data.upi,
          admissionNumber: data.admissionNumber,
          firstName: data.firstName,
          lastName: data.lastName,
          userName: data.userName,
          dateOfBirth: new Date(data.dateOfBirth),
          gender: data.gender,
          address: data.address,
          classId: data.classId,
          gradeId: data.gradeId,
          schoolId: data.schoolId,
          parentId: data.parentId,
          enrollmentDate: new Date(data.enrollmentDate),
          medicalInfo: data.medicalInfo,
          specialNeeds: data.specialNeeds,
          img: data.img || null,
          studentCategories: {
            set: data.studentCategories?.map((id: string) => ({ id })) || [],
          },
        },
      });

      // Check if academic year has changed
      // const latestEnrollment = originalStudent.enrollments[0];
      // if (latestEnrollment && latestEnrollment.academicYearId !== data.academicYearId) {
      //   if (!data.id || !data.classId || !data.schoolId) {
      //     throw new Error("Required fields are missing.");
      //   }
      //   // Create new enrollment
      //   await prisma.enrollment.create({
      //     data: {
      //       studentId: data.id,
      //       gradeId: data.gradeId,
      //       academicYearId: data.academicYearId!,
      //       classId: data.classId,
      //       schoolId: data.schoolId ||undefined,
      //       enrollmentDate: new Date(),
      //     },
      //   });
      // }
    });

    return {
      success: true,
      error: false,
      message: "Student updated successfully.",
    };
  } catch (err: any) {
    console.error("Error in updateStudent: ", err);
    // Handle Clerk-specific errors
    if (err.clerkError) {
      // Check if it's a password breach error
      if (err.errors?.[0]?.code === "form_password_pwned") {
        return {
          success: false,
          error: true,
          message:
            "Password has been found in an online data breach. Please use a different password.",
        };
      }

      // Handle username exists error
      if (err.errors?.[0]?.code === "form_identifier_exists") {
        return {
          success: false,
          error: true,
          message: "Username is already taken. Please choose another username.",
        };
      }

      // Handle any other Clerk errors by returning their specific messages
      if (err.errors && err.errors.length > 0) {
        return {
          success: false,
          error: true,
          message: err.errors[0].message,
          messages: err.errors.map((e: any) => e.message),
        };
      }
    }

    // Rollback Prisma changes
    if (originalStudent) {
      try {
        await prisma.student.update({
          where: { id: data.id },
          data: {
            upi: data.upi,
            admissionNumber: data.admissionNumber,
            firstName: data.firstName,
            lastName: data.lastName,
            userName: data.userName,
            dateOfBirth: new Date(data.dateOfBirth),
            gender: data.gender,
            address: data.address,
            classId: data.classId,
            gradeId: data.gradeId,
            schoolId: data.schoolId,
            parentId: data.parentId,
            enrollmentDate: new Date(data.enrollmentDate),
            medicalInfo: data.medicalInfo,
            specialNeeds: data.specialNeeds,
            img: data.img || null,
          },
        });
        // Rollback Clerk changes
        await clerkClient.users.updateUser(data.id, {
          username: originalStudent.userName,
          firstName: originalStudent.firstName,
          lastName: originalStudent.lastName,
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

export const deleteStudent = async (
  prevState: ResponseState,
  formData: FormData
): Promise<ResponseState> => {
  const id = formData.get("id") as string;
  if (!id) {
    return {
      success: false,
      error: true,
      message: "Student ID is required for deletion.",
    };
  }
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.$transaction(async (prisma) => {
      // Delete all enrollments associated with the student
      await prisma.enrollment.deleteMany({
        where: { studentId: id },
      });

      // Delete the student
      await prisma.student.delete({
        where: { id: id },
      });
    });

    return {
      success: true,
      error: false,
      message: "Student and associated enrollments deleted successfully.",
    };
  } catch (err: any) {
    console.error("Error in deleteStudent: ", err);

    // If Prisma or Clerk error has `errors`, return all error messages
    if (err.errors) {
      const errorMessages = err.errors.map((e: any) => e.message);
      return { success: false, error: true, messages: errorMessages };
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return { success: false, error: true, message: "Student not found." };
      }
    }

    return {
      success: false,
      error: true,
      message: err.message || "An error occurred during deletion.",
    };
  }
};
