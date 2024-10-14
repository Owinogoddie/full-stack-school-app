// app/bulk-add-results/page.tsx
import { Suspense } from 'react';
import { AppError, handleError } from '@/lib/error-handler';
import ErrorDisplay from '@/components/ErrorDisplay';
import FullScreenLoader from '@/components/full-screen-loader';
import BulkAddResultsClient from './BulkAddResultsClient';
import { getAcademicYears, getClasses, getExams, getGradeScales, getSubjects } from '@/actions/data-fetching';

async function fetchData() {
  try {
    const [exams, academicYears, subjects, classes, gradeScales] = await Promise.all([
      getExams(),
      getAcademicYears(),
      getSubjects(),
      getClasses(),
      getGradeScales(),
    ]);

    return { exams, academicYears, subjects, classes, gradeScales };
  } catch (error) {
    throw handleError(error);
  }
}

export default async function BulkAddResultsPage() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <BulkAddResultsContent />
    </Suspense>
  );
}

async function BulkAddResultsContent() {
  try {
    const relatedData = await fetchData();
    return <BulkAddResultsClient relatedData={relatedData} />;
  } catch (error) {
    if (error instanceof AppError) {
      return <ErrorDisplay message={error?.message || "Something went wrong"} />;
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}