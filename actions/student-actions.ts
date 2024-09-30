"use server"
import prisma from "@/lib/prisma";
import { StudentSchema } from "@/schemas/student-schema";
import { clerkClient } from "@clerk/nextjs/server";

type CurrentState = { success: boolean; error: boolean };

export const createStudent = async (
    currentState: CurrentState,
    data: StudentSchema
  ) => {
    console.log(data);
    try {
      const classItem = await prisma.class.findUnique({
        where: { id: data.classId },
        include: { _count: { select: { students: true } } },
      });
  
      if (classItem && classItem.capacity === classItem._count.students) {
        return { success: false, error: true };
      }
  
      const user = await clerkClient.users.createUser({
        username: data.username,
        password: data.password,
        firstName: data.name,
        lastName: data.surname,
        publicMetadata:{role:"student"}
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
  
      // revalidatePath("/list/students");
      return { success: true, error: false };
    } catch (err) {
      console.log(err);
      return { success: false, error: true };
    }
  };
  
  export const updateStudent = async (
    currentState: CurrentState,
    data: StudentSchema
  ) => {
    if (!data.id) {
      return { success: false, error: true };
    }
    try {
    //   const user = await clerkClient.users.updateUser(data.id, {
    //     username: data.username,
    //     ...(data.password !== "" && { password: data.password }),
    //     firstName: data.name,
    //     lastName: data.surname,
    //   });
  
      await prisma.student.update({
        where: {
          id: data.id,
        },
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
      // revalidatePath("/list/students");
      return { success: true, error: false };
    } catch (err) {
      console.log(err);
      return { success: false, error: true };
    }
  };
  
  export const deleteStudent = async (
    currentState: CurrentState,
    data: FormData
  ) => {
    const id = data.get("id") as string;
    try {
      await clerkClient.users.deleteUser(id);
  
      await prisma.student.delete({
        where: {
          id: id,
        },
      });
  
      // revalidatePath("/list/students");
      return { success: true, error: false };
    } catch (err) {
      console.log(err);
      return { success: false, error: true };
    }
  };