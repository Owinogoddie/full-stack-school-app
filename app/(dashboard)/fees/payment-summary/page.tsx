// app/(dashboard)/fees/payment-summary/page.tsx
import { Suspense } from "react";
import { AppError, handleError } from "@/lib/error-handler";
import ErrorDisplay from "@/components/ErrorDisplay";
import FullScreenLoader from "@/components/full-screen-loader";
import {
  getAcademicYears,
  getGrades,
  getFeeStructures,
} from "@/actions/fees/data-fetching";
import PaymentSummaryClient from "./PaymentSummaryClient";

async function fetchInitialData() {
  try {
    const [academicYears, grades, feeStructures] = await Promise.all([
      getAcademicYears(),
      getGrades(),
      getFeeStructures()
    ]);

    return {
      academicYears,
      grades: grades.map(grade => ({
        id: grade.id,
        name: grade.levelName
      })),
      feeStructures: feeStructures.map(fee => ({
        id: fee.id,
        name: `${fee.feeType.name}`,
        amount: fee.amount
      }))
    };
  } catch (error) {
    throw handleError(error);
  }
}

export default async function PaymentSummaryPage() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <PaymentSummaryContent />
    </Suspense>
  );
}

async function PaymentSummaryContent() {
  try {
    const initialData = await fetchInitialData();
    return <PaymentSummaryClient initialData={initialData} />;
  } catch (error) {
    if (error instanceof AppError) {
      return (
        <ErrorDisplay message={error?.message || "Something went wrong"} />
      );
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}