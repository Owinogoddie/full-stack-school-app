import BulkAddResultsClient from './BulkAddResultsClient';
import { getAcademicYears, getClasses, getExams, getGradeScales, getSubjects } from '@/actions/data-fetching';

export default async function BulkAddResultsPage() {
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

  return <BulkAddResultsClient relatedData={relatedData} />;
}