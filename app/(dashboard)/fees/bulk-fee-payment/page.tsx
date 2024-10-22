// app/bulk-fee-payment/page.tsx
import { Suspense } from "react";
import { AppError, handleError } from "@/lib/error-handler";
import ErrorDisplay from "@/components/ErrorDisplay";
import FullScreenLoader from "@/components/full-screen-loader";
import BulkFeePaymentClient from "./BulkFeePaymentClient";
import {
  getAcademicYears,
  getTerms,
  getGrades,
  getClasses,
  getFeeTypes,
} from "@/actions/fee/data-fetching";

async function fetchInitialData() {
  try {
    const [academicYears, terms, grades, classes, feeTypes] = await Promise.all(
      [getAcademicYears(), getTerms(), getGrades(), getClasses(), getFeeTypes()]
    );

    return {
      academicYears,
      terms: terms.map((term) => ({
        id: term.id,
        name: term.name,
        academicYearId: term.academicYearId,
      })),
      grades: grades.map((grade) => ({
        id: grade.id,
        name: grade.levelName,
      })),
      classes: classes.map((cls) => ({
        id: cls.id,
        name: cls.name,
        gradeId: cls.gradeId,
      })),
      feeTypes,
    };
  } catch (error) {
    throw handleError(error);
  }
}

export default async function BulkFeePaymentPage() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <BulkFeePaymentContent />
    </Suspense>
  );
}

async function BulkFeePaymentContent() {
  try {
    const initialData = await fetchInitialData();

    return <BulkFeePaymentClient initialData={initialData} />;
  } catch (error) {
    if (error instanceof AppError) {
      return (
        <ErrorDisplay message={error?.message || "Something went wrong"} />
      );
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}