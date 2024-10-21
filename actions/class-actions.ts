'use server'

import prisma from "@/lib/prisma";
import { ClassSchema } from "@/schemas/class-schema";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

export const createClass = async (formData: ClassSchema): Promise<ResponseState> => {
  try {
    console.log(formData)
    // Create a new object to hold data for creation
    const dataToCreate: any = { ...formData };

    // Check if a class with the same name already exists
    const existingClass = await prisma.class.findFirst({
      where: { name: dataToCreate.name }
    });

    if (existingClass) {
      return { success: false, error: true, message: "A class with this name already exists." };
    }

    // Remove supervisorId if it's an empty string
    if (dataToCreate.supervisorId === "") {
      delete dataToCreate.supervisorId; // Remove supervisorId from dataToCreate
    } else {
      // Validate the supervisorId if it's not empty
      const supervisorExists = await prisma.teacher.findUnique({
        where: { id: dataToCreate.supervisorId },
      });
      if (!supervisorExists) {
        return { success: false, error: true, message: "The supervisor ID does not exist." };
      }
    }

    await prisma.class.create({
      data: dataToCreate,
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Error in createClass: ", err);

    if (err?.code === "P2002") {
      const targetField = err.meta?.target;
      return { success: false, error: true, message: `The ${targetField} is already in use. Please try another.` };
    }

    return { success: false, error: true, message: err.message || "An error occurred during class creation." };
  }
};

export const updateClass = async (formData: ClassSchema): Promise<ResponseState> => {
  console.log(formData);
  if (!formData.id) {
    return { success: false, error: true, message: "Class ID is required for update." };
  }

  let originalClass;
  try {
    originalClass = await prisma.class.findUnique({
      where: { id: formData.id },
    });

    if (!originalClass) {
      return { success: false, error: true, message: "Class not found." };
    }

    // Check if the new name (if changed) is already in use by another class
    if (formData.name && formData.name !== originalClass.name) {
      const existingClass = await prisma.class.findFirst({
        where: { 
          name: formData.name,
          id: { not: formData.id } // Exclude the current class
        }
      });

      if (existingClass) {
        return { success: false, error: true, message: "A class with this name already exists." };
      }
    }

    // Create an object to hold only the fields we want to update
    const dataToUpdate: Partial<ClassSchema> = {};

    // Check if class name, capacity, and gradeId are provided and add to the update object
    if (formData.name) {
      dataToUpdate.name = formData.name;
    }
    if (formData.capacity) {
      dataToUpdate.capacity = formData.capacity;
    }
    if (formData.gradeId) {
      dataToUpdate.gradeId = formData.gradeId;
    }

    // Handle supervisorId separately
    if (formData.supervisorId !== undefined) {
      if (formData.supervisorId === "" || formData.supervisorId === "null") {
        // Use Prisma's null to set the field to NULL in the database
        (dataToUpdate as any).supervisorId = null;
      } else if (formData.supervisorId) {
        // Validate the supervisorId if it's not empty and not 'null'
        const supervisorExists = await prisma.teacher.findUnique({
          where: { id: formData.supervisorId },
        });
        if (!supervisorExists) {
          return { success: false, error: true, message: "The supervisor ID does not exist." };
        }
        dataToUpdate.supervisorId = formData.supervisorId;
      }
    }

    // Now update the class with only the necessary fields
    await prisma.class.update({
      where: { id: formData.id },
      data: dataToUpdate,
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Error in updateClass: ", err);

    if (err?.code === "P2002") {
      const targetField = err.meta?.target;
      return { success: false, error: true, message: `The ${targetField} is already in use. Please try another.` };
    }

    return { success: false, error: true, message: err.message || "An error occurred during class update." };
  }
};

export const deleteClass = async (currentState: ResponseState, formData: FormData): Promise<ResponseState> => {
  const id = formData.get("id") as string;
  if (!id) {
    return { success: false, error: true, message: "Class ID is required for deletion." };
  }

  try {
    await prisma.class.delete({
      where: { id: parseInt(id) },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Error in deleteClass: ", err);

    if (err?.code === "P2025") {
      return { success: false, error: true, message: "Class not found." };
    }

    return { success: false, error: true, message: err.message || "An error occurred during class deletion." };
  }
};