import { Suspense } from 'react';
import { ResultsFilterComponent } from './results-filter-component';
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export default async function ResultsFilterPage() {
  const {  sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (role !== 'admin' && role !== 'teacher') {
    return <div>Access denied. You must be an admin or teacher to view this page.</div>;
  }

  const relatedData = await prisma.$transaction([
    prisma.exam.findMany(),
    prisma.subject.findMany(),
    prisma.academicYear.findMany(),
    prisma.class.findMany(),
    prisma.gradeScale.findMany(),
  ]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Results Filter</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <ResultsFilterComponent
          relatedData={{
            exams: relatedData[0],
            subjects: relatedData[1],
            academicYears: relatedData[2],
            classes: relatedData[3],
            gradeScales: relatedData[4],
          }}
        />
      </Suspense>
    </div>
  );
}