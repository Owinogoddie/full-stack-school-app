'use server'
import prisma from "@/lib/prisma";
import { DepartmentSchema } from "@/schemas/department-schema";
import { Prisma } from "@prisma/client";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

const handleEmptyString = (value: string | null | undefined) => 
  value === "" ? null : value;

export const createDepartment = async (data: DepartmentSchema): Promise<ResponseState> => {
  try {
    await prisma.department.create({
      data: {
        name: data.name,
        description: data.description,
        headTeacherId: handleEmptyString(data.headTeacherId),
        schoolId: handleEmptyString(data.schoolId),
      },
    });
    return { success: true, error: false, message: "Department created successfully" };
  } catch (err) {
    console.error(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return { 
          success: false, 
          error: true, 
          message: "That teacher already has a department." 
        };
      }
    }
    return { success: false, error: true, message: "Failed to create department" };
  }
};

export const updateDepartment = async (data: DepartmentSchema): Promise<ResponseState> => {
  try {
    if (!data.id) {
      throw new Error("Department ID is required for update");
    }
    await prisma.department.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        headTeacherId: handleEmptyString(data.headTeacherId),
        schoolId: handleEmptyString(data.schoolId),
      },
    });
    return { success: true, error: false, message: "Department updated successfully" };
  } catch (err) {
    console.error(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return { 
          success: false, 
          error: true, 
          message: "That teacher already has a department." 
        };
      }
    }
    return { success: false, error: true, message: "Failed to update department" };
  }
};

export const deleteDepartment = async (currentState: ResponseState, formData: FormData): Promise<ResponseState> => {
  const id = formData.get('id');
  try {
    await prisma.department.delete({
      where: {
        id: Number(id),
      },
    });
    return { success: true, error: false, message: "Department deleted successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to delete Department" };
  }
};