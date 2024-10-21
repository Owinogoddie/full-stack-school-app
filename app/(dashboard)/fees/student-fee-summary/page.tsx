import { Suspense } from "react";
import { AppError, handleError } from "@/lib/error-handler";
import ErrorDisplay from "@/components/ErrorDisplay";
import FullScreenLoader from "@/components/full-screen-loader";
import {
  getAcademicYears,
//   getTerms,
  getGrades,
//   getClasses,
  getFeeTypes,
} from "@/actions/fee/data-fetching";
import StudentFeeSummaryClient from "./StudentFeeSummaryClient";

async function fetchInitialData() {
  try {
    const [academicYears, grades, feeTypes] = await Promise.all([
      getAcademicYears(),
      getGrades(),
      getFeeTypes()
    ]);

    return {
      academicYears,
      grades: grades.map(grade => ({
        id: grade.id,
        name: grade.levelName
      })),
      feeTypes
    };
  } catch (error) {
    throw handleError(error);
  }
}

export default async function StudentFeeSummaryPage() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <StudentFeeSummaryContent />
    </Suspense>
  );
}

async function StudentFeeSummaryContent() {
  try {
    const initialData = await fetchInitialData();
    
    return <StudentFeeSummaryClient initialData={initialData} />;
  } catch (error) {
    if (error instanceof AppError) {
      return (
        <ErrorDisplay message={error?.message || "Something went wrong"} />
      );
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}