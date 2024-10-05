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
  const router = useRouter();

  useEffect(() => {
    console.log('classId:', classId);
    if (!classId) {
      toast.error('Class ID is missing.');
      return;
    }

    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/students?classId=${classId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }
        const data: Student[] = await response.json();
        setStudents(data);
      } catch (error: any) {
        console.error('Error fetching students:', error);
        toast.error(`Failed to load students: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classId]);

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
        toast.success(response.message || 'Results added successfully');
        router.push('/list/results/results/bulk-add');
      } else {
        toast.error(response.message || 'Failed to add results');
      }
    } catch (error: any) {
      console.error('Error submitting results:', error);
      toast.error(`Failed to add results: ${error.message}`);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (students.length === 0) {
    return <div>No students found for this class.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <table className="w-full">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Admission Number</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{`${student.firstName} ${student.lastName}`}</td>
              <td>{student.admissionNumber}</td>
              <td>
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
                  className="border rounded px-2 py-1"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded-md"
      >
        Submit Results
      </button>
    </form>
  );
}