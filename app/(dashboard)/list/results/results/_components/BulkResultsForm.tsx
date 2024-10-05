'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createBulkResults } from '@/actions/bulk-result-actions';
import toast from 'react-hot-toast';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  admissionNumber: string;
}

interface Result {
  id: number;
  studentId: number;
  score: number;
  student: Student;
}

interface BulkResultsFormProps {
  examId: number;
  subjectId: number;
  academicYearId: number;
  classId: number;
  gradeScaleId: number;
}

export default function BulkResultsForm({
  examId,
  subjectId,
  academicYearId,
  classId,
  gradeScaleId,
}: BulkResultsFormProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [scores, setScores] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [existingResults, setExistingResults] = useState<Result[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!classId || !subjectId || !examId) {
      toast.error('Class ID, Subject ID, or Exam ID is missing.');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [studentsResponse, resultsResponse] = await Promise.all([
          fetch(`/api/students?classId=${classId}`),
          fetch(`/api/results?classId=${classId}&subjectId=${subjectId}&examId=${examId}`),
        ]);

        if (!studentsResponse.ok || !resultsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const studentsData: Student[] = await studentsResponse.json();
        const resultsData: Result[] = await resultsResponse.json();

        setStudents(studentsData);
        setExistingResults(resultsData);

        // Pre-fill scores if results exist
        const initialScores: Record<number, string> = {};
        resultsData.forEach((result) => {
          initialScores[result.studentId] = result.score.toString();
        });
        setScores(initialScores);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast.error(`Failed to load data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId, subjectId, examId]);

  const handleScoreChange = (studentId: number, score: string) => {
    setScores((prev) => ({ ...prev, [studentId]: score }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const results = students
      .filter((student) => {
        const score = formData.get(`score_${student.id}`) as string;
        return score && score.trim() !== '';
      })
      .map((student) => ({
        studentId: student.id,
        examId,
        subjectId,
        academicYearId,
        classId,
        gradeScaleId,
        score: parseFloat(formData.get(`score_${student.id}`) as string),
      }));

    if (results.length === 0) {
      toast.error('No valid scores to submit');
      return;
    }

    try {
      const response = await createBulkResults(results);

      if (response.success) {
        toast.success(response.message || 'Results processed successfully');
        router.push(`/list/results?classId=${classId}&subjectId=${subjectId}`);
      } else {
        toast.error(response.message || 'Failed to process results');
      }
    } catch (error: any) {
      console.error('Error submitting results:', error);
      toast.error(`Failed to process results: ${error.message}`);
    }
  };

  const refreshPage = () => {
    window.location.reload();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <p className="text-lg font-semibold text-gray-700">
          No students found for this class.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={() => router.push('/list/results')}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Back to Results
          </button>
          <button
            onClick={refreshPage}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white shadow-lg rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Student Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Admission Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Score
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((student) => (
            <tr key={student.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {`${student.firstName} ${student.lastName}`}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.admissionNumber}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <input
                  type="hidden"
                  name={`studentId_${student.id}`}
                  value={student.id}
                />
                <input
                  type="number"
                  step="0.01"
                  name={`score_${student.id}`}
                  value={scores[student.id] || ''}
                  onChange={(e) => handleScoreChange(student.id, e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-green-500 focus:border-green-500 block w-full"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md shadow-md transition-colors duration-200 ease-in-out"
        >
          {existingResults.length > 0 ? 'Update Results' : 'Submit Results'}
        </button>
      </div>
    </form>
  );
}
