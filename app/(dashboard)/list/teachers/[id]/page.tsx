// app/list/teachers/[id]/page.tsx
import { Suspense } from 'react';
import { notFound } from "next/navigation";
import { AppError, handleError } from '@/lib/error-handler';
import ErrorDisplay from '@/components/ErrorDisplay';
import prisma from "@/lib/prisma";
import { Teacher, Subject, Class } from "@prisma/client";
import SingleTeacherView from './SingleTeacherView';

type TeacherWithRelations = Teacher & {
  subjects: Subject[];
  classes: Class[];
  _count: {
    subjects: number;
    lessons: number;
    classes: number;
  };
};

async function fetchTeacher(id: string): Promise<TeacherWithRelations> {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        subjects: true,
        classes: true,
        _count: {
          select: {
            subjects: true,
            lessons: true,
            classes: true,
          },
        },
      },
    });

    if (!teacher) {
      notFound();
    }

    return teacher;
  } catch (error) {
    throw handleError(error);
  }
}

export default async function SingleTeacherPage({
  params: { id },
}: {
  params: { id: string };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SingleTeacherContent id={id} />
    </Suspense>
  );
}

async function SingleTeacherContent({ id }: { id: string }) {
  try {
    const teacher = await fetchTeacher(id);
    return <SingleTeacherView teacher={teacher} />;
  } catch (error) {
    if (error instanceof AppError) {
      return <ErrorDisplay message={error?.message || "Something went wrong"} />;
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}