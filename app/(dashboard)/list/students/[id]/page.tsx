// SingleStudentPage.tsx
import { Suspense } from "react";
import { AppError, handleError } from '@/lib/error-handler';
import ErrorDisplay from '@/components/ErrorDisplay';
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import SingleStudentView from './SingleStudentView';

async function fetchStudentData(id: string) {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        class: { include: { _count: { select: { lessons: true } } } },
        grade: true,
        school: true,
        parent: true,
        studentCategories: true,
      },
    });

    if (!student) {
      return notFound();
    }

    return { student, role };
  } catch (error) {
    throw handleError(error);
  }
}

export default async function SingleStudentPage({
  params: { id },
}: {
  params: { id: string };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SingleStudentPageContent id={id} />
    </Suspense>
  );
}

async function SingleStudentPageContent({ id }: { id: string }) {
  try {
    const { student, role } = await fetchStudentData(id);
    return <SingleStudentView student={student} role={role} />;
  } catch (error) {
    if (error instanceof AppError) {
      return <ErrorDisplay message={error?.message || "Something went wrong"} />;
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}