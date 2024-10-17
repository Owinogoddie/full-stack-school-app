// user-actions.ts
'use server'
import prisma from "@/lib/prisma";

export const getUserCount = async (type: "admin" | "teacher" | "student" | "parent"): Promise<number> => {
  const modelMap: Record<"admin" | "teacher" | "student" | "parent", {
    count: () => Promise<number>
  }> = {
    admin: prisma.admin,
    teacher: prisma.teacher,
    student: prisma.student,
    parent: prisma.parent,
  };

  try {
    const count = await modelMap[type].count();
    return count;
  } catch (error) {
    console.error(`Error counting ${type}:`, error);
    return 0;
  }
};
