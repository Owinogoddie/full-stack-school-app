import { Suspense } from 'react';
import { ResultsFilterComponent } from './results-filter-component';
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import FullScreenLoader from '@/components/full-screen-loader';
import { AppError, handleError } from '@/lib/error-handler';
import ErrorDisplay from '@/components/ErrorDisplay';

async function fetchRelatedData() {
  try {
    const relatedData = await prisma.$transaction([
      prisma.exam.findMany(),
      prisma.subject.findMany(),
      prisma.academicYear.findMany(),
      prisma.class.findMany(),
      prisma.grade.findMany(),
    ]);

    return {
      exams: relatedData[0],
      subjects: relatedData[1],
      academicYears: relatedData[2],
      classes: relatedData[3],
      grades: relatedData[4],
    };
  } catch (error) {
    throw handleError(error);
  }
}

export default async function ResultsFilterPage() {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (role !== 'admin' && role !== 'teacher') {
    return <div>Access denied. You must be an admin or teacher to view this page.</div>;
  }

  try {
    const relatedData = await fetchRelatedData();
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Results Filter</h1>
        <Suspense fallback={<div><FullScreenLoader /></div>}>
          <ResultsFilterComponent relatedData={relatedData} schoolName="X-Academy" />
        </Suspense>
      </div>
    );
  } catch (error) {
    if (error instanceof AppError) {
      return <ErrorDisplay message={error?.message || "Something went wrong"} />;
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}
