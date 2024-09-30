"use server"

type CurrentState = { success: boolean; error: boolean };
import prisma from "@/lib/prisma";
import { ClassSchema } from "@/schemas/class-schema";

export const createClass = async (
    currentState: CurrentState,
    data: ClassSchema
  ) => {
    try {
      await prisma.class.create({
        data,
      });
  
      // revalidatePath("/list/class");
      return { success: true, error: false };
    } catch (err) {
      console.log(err);
      return { success: false, error: true };
    }
  };
  
  export const updateClass = async (
    currentState: CurrentState,
    data: ClassSchema
  ) => {
    try {
      await prisma.class.update({
        where: {
          id: data.id,
        },
        data,
      });
  
      // revalidatePath("/list/class");
      return { success: true, error: false };
    } catch (err) {
      console.log(err);
      return { success: false, error: true };
    }
  };
  
  export const deleteClass = async (
    currentState: CurrentState,
    data: FormData
  ) => {
    const id = data.get("id") as string;
    try {
      await prisma.class.delete({
        where: {
          id: parseInt(id),
        },
      });
  
      // revalidatePath("/list/class");
      return { success: true, error: false };
    } catch (err) {
      console.log(err);
      return { success: false, error: true };
    }
  };