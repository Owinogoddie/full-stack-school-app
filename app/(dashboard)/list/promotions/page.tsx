import { Suspense } from 'react';
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import FullScreenLoader from '@/components/full-screen-loader';
import PromotionsComponent from './PromotionsComponent';

export default async function PromotionsPage() {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (role !== 'admin' && role !== 'teacher') {
    return <div>Access denied. You must be an admin or teacher to view this page.</div>;
  }

  const [academicYears, grades,exams, classes] = await prisma.$transaction([
    prisma.academicYear.findMany(),
    prisma.grade.findMany(),
    prisma.exam.findMany(),
    prisma.class.findMany(),
  ]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Student Promotions</h1>
      <Suspense fallback={<FullScreenLoader/>}>
        <PromotionsComponent
          academicYears={academicYears}
          grades={grades}
          classes={classes}
          exams={exams}
        />
      </Suspense>
    </div>
  );
}