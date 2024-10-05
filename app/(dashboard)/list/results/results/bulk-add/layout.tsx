import { getAcademicYears, getClasses, getExams, getGradeScales, getSubjects } from '@/actions/data-fetching';
import { Suspense } from 'react';
import BulkAddResultsPage from './page';

export default async function BulkAddResultsLayout() {
  const [exams, academicYears, subjects, classes, gradeScales] = await Promise.all([
    getExams(),
    getAcademicYears(),
    getSubjects(),
    getClasses(),
    getGradeScales(),
  ]);

  const relatedData = {
    exams,
    academicYears,
    subjects,
    classes,
    gradeScales,
  };

  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <BulkAddResultsPage relatedData={relatedData} />
      </Suspense>
    </div>
  );
}