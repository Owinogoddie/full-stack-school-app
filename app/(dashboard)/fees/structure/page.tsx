import { Suspense } from "react";
import { AppError, handleError } from "@/lib/error-handler";
import ErrorDisplay from "@/components/ErrorDisplay";
import FullScreenLoader from "@/components/full-screen-loader";
import FeeStructureClient from "./FeeStructureClient";
import {
  getStudentCategories,
  getAcademicYears,
  getTerms,
  getGrades,
  getClasses,
  getSpecialProgrammes
} from "@/actions/fee/fee-structure";

async function fetchInitialData() {
  try {
    const [academicYears, terms, grades, classes, studentCategories,specialProgrammes] =
      await Promise.all([
        getAcademicYears(),
        getTerms(),
        getGrades(),
        getClasses(),
        getStudentCategories(),
        getSpecialProgrammes()
      ]);
    return {
      academicYears,
      terms,
      grades,
      classes,
      studentCategories,
      specialProgrammes,
    };
  } catch (error) {
    throw handleError(error);
  }
}

export default async function FeeStructurePage() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <FeeStructureContent />
    </Suspense>
  );
}

async function FeeStructureContent() {
  try {
    const initialData = await fetchInitialData();
    return <FeeStructureClient initialData={initialData} />;
  } catch (error) {
    if (error instanceof AppError) {
      return <ErrorDisplay message={error?.message || "Something went wrong"} />;
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}