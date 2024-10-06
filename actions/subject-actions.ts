// actions/subject-actions.ts
'use server'

import prisma from "@/lib/prisma";
import { SubjectSchema } from "@/schemas/subject-schema";
import { Prisma, Subject } from "@prisma/client";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

export const createSubject = async (data: SubjectSchema): Promise<ResponseState> => {
  try {
    const newSubject = await prisma.subject.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description || "",
        parentId: data.parentId ? parseInt(data.parentId, 10) : null,
        teachers: {
          connect: data.teacherIds?.map(id => ({ id })) || [],
        },
      },
    });

    if (newSubject.parentId) {
      await updateRelatedSubjects(newSubject.parentId);
    }

    return { success: true, error: false, message: "Subject created successfully" };
  } catch (err) {
    console.error(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return { 
          success: false, 
          error: true, 
          message: "A subject with this code already exists. Please use a unique code." 
        };
      }
    }
    return { success: false, error: true, message: "Failed to create subject. Please try again." };
  }
};

export const updateSubject = async (data: SubjectSchema): Promise<ResponseState> => {
  try {
    if (!data.id) {
      throw new Error("Subject ID is required for update");
    }

    const oldSubject = await prisma.subject.findUnique({
      where: { id: data.id },
    });

    const updatedSubject = await prisma.subject.update({
      where: { id: data.id },
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        parentId: data.parentId ? parseInt(data.parentId, 10) : null,
        teachers: {
          set: data.teacherIds?.map(id => ({ id })) || [],
        },
      },
    });

    if (oldSubject?.parentId !== updatedSubject.parentId) {
      if (oldSubject?.parentId) {
        await updateRelatedSubjects(oldSubject.parentId);
      }
      if (updatedSubject.parentId) {
        await updateRelatedSubjects(updatedSubject.parentId);
      }
    }

    return { success: true, error: false, message: "Subject updated successfully" };
  } catch (err) {
    console.error(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return { 
          success: false, 
          error: true, 
          message: "A subject with this code already exists. Please use a unique code." 
        };
      }
    }
    return { success: false, error: true, message: "Failed to update subject. Please try again." };
  }
};

export const deleteSubject = async (currentState: ResponseState, formData: FormData): Promise<ResponseState> => {
  const id = formData.get('id');
  try {
    const deletedSubject = await prisma.subject.delete({
      where: {
        id: Number(id),
      },
    });

    if (deletedSubject.parentId) {
      await updateRelatedSubjects(deletedSubject.parentId);
    }

    return { success: true, error: false, message: "Subject deleted successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to delete Subject" };
  }
};

export const getSubjects = async (): Promise<Subject[]> => {
  return await prisma.subject.findMany({
    include: {
      parent: true,
      children: true,
      relatedTo: true,
      teachers: true,
    }
  });
};

async function updateRelatedSubjects(parentId: number) {
  const siblings = await prisma.subject.findMany({
    where: { parentId: parentId },
  });

  for (let i = 0; i < siblings.length; i++) {
    const currentSubject = siblings[i];
    const relatedSubjects = siblings.filter(s => s.id !== currentSubject.id);

    await prisma.subject.update({
      where: { id: currentSubject.id },
      data: {
        relatedTo: {
          set: relatedSubjects.map(s => ({ id: s.id })),
        },
        relatedFrom: {
          set: relatedSubjects.map(s => ({ id: s.id })),
        },
      },
    });
  }
}

export const getRelatedData = async () => {
  const [subjects, teachers] = await Promise.all([
    prisma.subject.findMany({ select: { id: true, name: true } }),
    prisma.teacher.findMany({ select: { id: true, firstName: true } }),
  ]);

  return { subjects, teachers };
};