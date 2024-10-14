import { Suspense } from 'react';
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import FullScreenLoader from '@/components/full-screen-loader';
import { AttendanceComponent } from './attendance-component';
import { AppError } from '@/lib/error-handler';
import ErrorDisplay from '@/components/ErrorDisplay';

export default async function AttendancePage() {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (role !== 'admin' && role !== 'teacher') {
    return <div>Access denied. You must be an admin or teacher to view this page.</div>;
  }

  try {
    const relatedData = await prisma.$transaction([
      prisma.grade.findMany(),
      prisma.class.findMany(),
    ]);

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Daily Attendance</h1>
        <Suspense fallback={<FullScreenLoader />}>
          <AttendanceComponent
            relatedData={{
              grades: relatedData[0],
              classes: relatedData[1],
            }}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    // Handle the error
    if (error instanceof AppError) {
      return <ErrorDisplay message={error?.message || "Something went wrong"} />;
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}
