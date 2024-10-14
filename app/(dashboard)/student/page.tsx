import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { AppError } from "@/lib/error-handler";
import ErrorDisplay from "@/components/ErrorDisplay";
import StudentSchedule from "./StudentSchedule";

async function fetchStudentClassData() {
  const { userId } = auth();

  const classItem = await prisma.class.findMany({
    where: {
      students: { some: { id: userId! } },
    },
  });

  return classItem;
}
export default async function StudentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StudentPageContent />
    </Suspense>
  );
}

async function StudentPageContent() {
  try {
    const classItem = await fetchStudentClassData();
    return <StudentSchedule classItem={classItem} />;
  } catch (error) {
    if (error instanceof AppError) {
      return <ErrorDisplay message={error.message || "Something went wrong"} />;
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}
