import { Suspense } from 'react';
import { ResultsRankingComponent } from './results-ranking-component';
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import FullScreenLoader from '@/components/full-screen-loader';

export default async function ResultsRankingPage() {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (role !== 'admin' && role !== 'teacher') {
    return <div>Access denied. You must be an admin or teacher to view this page.</div>;
  }

  const relatedData: any = await prisma.$transaction([
    prisma.academicYear.findMany(),
    prisma.exam.findMany(),
    prisma.class.findMany(),
    prisma.grade.findMany(),
    prisma.subject.findMany(),
  ]);

  // Fetch the school name
  const school = await prisma.school.findFirst();
  const schoolName = school?.name || "Default School Name";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Results Ranking</h1>
      <Suspense fallback={<div><FullScreenLoader/></div>}>
        <ResultsRankingComponent
          relatedData={{
            academicYears: relatedData[0],
            exams: relatedData[1],
            classes: relatedData[2],
            grades: relatedData[3],
            subjects: relatedData[4],
          }}
          schoolName={schoolName}
        />
      </Suspense>
    </div>
  );
}