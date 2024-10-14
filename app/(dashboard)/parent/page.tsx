// ParentPage.tsx
import { Suspense } from 'react';
import { AppError, handleError } from '@/lib/error-handler';
import ErrorDisplay from '@/components/ErrorDisplay';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import ParentStudentSchedule from './ParentStudentSchedule';

async function fetchParentStudents() {
  const { userId } = auth();
  
  try {
    const students = await prisma.student.findMany({
      where: {
        parentId: userId!,
      },
      include: {
        class: true,
      },
    });
    return { students };
  } catch (error) {
    throw handleError(error);
  }
}

export default async function ParentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ParentPageContent />
    </Suspense>
  );
}

async function ParentPageContent() {
  try {
    const { students } = await fetchParentStudents();
    return <ParentStudentSchedule students={students} />;
  } catch (error) {
    if (error instanceof AppError) {
      return <ErrorDisplay message={error?.message || 'Something went wrong'} />;
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}
