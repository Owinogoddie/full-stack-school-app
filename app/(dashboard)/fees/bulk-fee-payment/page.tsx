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
  getFeeStructures,
} from "@/actions/fees/data-fetching";

async function fetchInitialData() {
  try {
    const [academicYears, terms, grades, classes, feeStructures] = await Promise.all([
      getAcademicYears(),
      getTerms(),
      getGrades(),
      getClasses(),
      getFeeStructures(),
    ]);

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
      feeStructures: feeStructures.map(structure => ({
        id: structure.id,
        name: structure.feeType.name,
        description: structure.feeType.description,
        amount: structure.amount,
        academicYearId: structure.academicYearId,
        termId: structure.termId,
        gradeId: structure.grades[0]?.id,
        classId: structure.classes[0]?.id,
        categories: structure.categories.map(cat => ({
          id: cat.id,
          name: cat.name
        }))
      }))
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
      return <ErrorDisplay message={error?.message || "Something went wrong"} />;
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}