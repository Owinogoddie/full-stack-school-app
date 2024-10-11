'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Select from 'react-select';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  grade: { id: number; levelName: string };
  class: { id: number; name: string };
  overallAverage: number;
  subjectResults: Array<{
    subjectId: number;
    name: string;
    averageScore: number;
  }>;
  examResults: Array<{
    exam: { id: number; title: string };
  }>;
  rank: number;
  promoted:boolean;
  promotionStatus: 'ACTIVE' | 'COMPLETED' | 'REPEATED' | 'PENDING';
};

type PromotionsComponentProps = {
  academicYears: Array<{ id: number; year: string }>;
  grades: Array<{ id: number; levelName: string }>;
  classes: Array<{ id: number; name: string; gradeId: number }>;
  exams: Array<{ id: number; title: string; academicYearId: number }>;
};

const PromotionsComponent: React.FC<PromotionsComponentProps> = ({
  academicYears,
  grades,
  classes,
  exams,
}) => {
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<number | null>(null);
  const [selectedNewAcademicYear, setSelectedNewAcademicYear] = useState<number | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedExams, setSelectedExams] = useState<number[]>([]);
  const [selectedNewGrade, setSelectedNewGrade] = useState<number | null>(null);
  const [selectedNewClass, setSelectedNewClass] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    if (!selectedAcademicYear) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        academicYearId: selectedAcademicYear.toString(),
        ...(selectedGrade && { gradeId: selectedGrade.toString() }),
        ...(selectedClass && { classId: selectedClass.toString() }),
        ...(search && { search }),
      });

      selectedExams.forEach(examId => {
        params.append('examIds[]', examId.toString());
      });

      const response = await fetch(`/api/promotions?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      const data = await response.json();
      setStudents(data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to fetch students. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedAcademicYear, selectedGrade, selectedClass, selectedExams, search]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handlePromote = async (promotionStatus: 'PROMOTED' | 'REPEATED') => {
    if (!selectedNewAcademicYear || !selectedNewGrade || selectedStudents.length === 0) {
      setError('Please select all required fields and at least one student.');
      return;
    }

    if (selectedAcademicYear === selectedNewAcademicYear) {
      setError('New academic year must be different from the current one.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academicYearId: selectedAcademicYear,
          newAcademicYearId: selectedNewAcademicYear,
          gradeId: selectedGrade,
          newGradeId: selectedNewGrade,
          classId: selectedClass,
          newClassId: selectedNewClass,
          studentIds: selectedStudents,
          promotionStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update students');
      }

      const data = await response.json();
      alert('Students updated successfully');
      setSelectedStudents([]);
      fetchStudents();
      generateUpdatedStudentsList(data.updatedStudents);
    } catch (error) {
      console.error('Error updating students:', error);
      setError('Error updating students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateReportCard = (student: Student) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Report Card for ${student.firstName} ${student.lastName}`, 14, 22);
    doc.setFontSize(12);
    doc.text(`Grade: ${student.grade.levelName}`, 14, 32);
    doc.text(`Class: ${student.class.name}`, 14, 40);
    doc.text(`Overall Average: ${student.overallAverage.toFixed(2)}`, 14, 48);
    doc.text(`Rank: ${student.rank}`, 14, 56);
    doc.text(`Promotion Status: ${student.promotionStatus}`, 14, 64);

    const tableData = student.subjectResults.map(result => [
      result.name,
      result.averageScore.toFixed(2),
    ]);

    (doc as any).autoTable({
      head: [['Subject', 'Average Score']],
      body: tableData,
      startY: 74,
    });

    doc.save(`${student.firstName}_${student.lastName}_report_card.pdf`);
  };

  const generateUpdatedStudentsList = (updatedStudents: any[]) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Updated Students List', 14, 22);
    doc.setFontSize(12);

    const tableData = updatedStudents.map(student => [
      `${student.firstName} ${student.lastName}`,
      student.grade.levelName,
      student.class?.name || 'N/A',
      student.promotionStatus,
    ]);

    (doc as any).autoTable({
      head: [['Student Name', 'New Grade', 'New Class', 'Status']],
      body: tableData,
      startY: 30,
    });

    doc.save('updated_students_list.pdf');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Student Promotions</h2>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Select
          options={academicYears.map(ay => ({ value: ay.id, label: ay.year }))}
          onChange={(option: any) => setSelectedAcademicYear(option?.value)}
          placeholder="Select Current Academic Year"
        />
        <Select
          options={grades.map(g => ({ value: g.id, label: g.levelName }))}
          onChange={(option: any) => {
            setSelectedGrade(option?.value);
            setSelectedClass(null);
          }}
          placeholder="Select Grade"
        />
        <Select
          options={classes.filter(c => !selectedGrade || c.gradeId === selectedGrade).map(c => ({ value: c.id, label: c.name }))}
          onChange={(option: any) => setSelectedClass(option?.value)}
          placeholder="Select Class"
          isDisabled={!selectedGrade}
        />
        <Select
          options={exams.filter(e => e.academicYearId === selectedAcademicYear).map(e => ({ value: e.id, label: e.title }))}
          onChange={(options: any) => setSelectedExams(options.map((opt: any) => opt.value))}
          placeholder="Select Exams"
          isMulti
          isDisabled={!selectedAcademicYear}
        />
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded"
        />
      </div>

      {loading ? (
        <p>Loading students...</p>
      ) : (
        <table className="w-full mb-6">
          <thead>
            <tr>
              <th>Select</th>
              <th>Rank</th>
              <th>Name</th>
              <th>Grade</th>
              <th>Class</th>
              <th>Overall Average</th>
              <th>Promotion Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
  {students.map(student => (
    <tr key={student.id}>
      <td>
        <input
          type="checkbox"
          checked={selectedStudents.includes(student.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedStudents([...selectedStudents, student.id]);
            } else {
              setSelectedStudents(selectedStudents.filter(id => id !== student.id));
            }
          }}
        />
      </td>
      <td>{student.rank}</td>
      <td>{`${student.firstName} ${student.lastName}`}</td>
      <td>{student.grade.levelName}</td>
      <td>{student.class.name}</td>
      <td>{student.overallAverage.toFixed(2)}</td>
      {/* <td>{student.promotionStatus}</td> */}
      <td>{student.promoted ? 'Promoted' : 'Not Promoted'}</td>
      <td>
        <button
          onClick={() => generateReportCard(student)}
          className="bg-blue-500 text-white px-2 py-1 rounded"
        >
          Generate Report Card
        </button>
      </td>
    </tr>
  ))}
</tbody>
        </table>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Select
          options={academicYears.map(ay => ({ value: ay.id, label: ay.year }))}
          onChange={(option: any) => setSelectedNewAcademicYear(option?.value)}
          placeholder="Select New Academic Year"
        />
        <Select
          options={grades.map(g => ({ value: g.id, label: g.levelName }))}
          onChange={(option: any) => setSelectedNewGrade(option?.value)}
          placeholder="Select New Grade"
        />
        <Select
          options={classes.filter(c => !selectedNewGrade || c.gradeId === selectedNewGrade).map(c => ({ value: c.id, label: c.name }))}
          onChange={(option: any) => setSelectedNewClass(option?.value)}
          placeholder="Select New Class"
          isDisabled={!selectedNewGrade}
        />
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => handlePromote('PROMOTED')}
          className="bg-green-500 text-white px-4 py-2 rounded"
          disabled={!selectedNewAcademicYear || !selectedNewGrade || selectedStudents.length === 0}
        >
          Promote Selected Students
        </button>
        <button
          onClick={() => handlePromote('REPEATED')}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
          disabled={!selectedNewAcademicYear || !selectedNewGrade || selectedStudents.length === 0}
        >
          Repeat Selected Students
        </button>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold mb-2">Requirements:</h3>
        <ul className="list-disc list-inside">
          <li>Select current and new academic years (must be different)</li>
          <li>Select current grade and class (optional)</li>
          <li>Select new grade</li>
          <li>Select new class (optional)</li>
          <li>Select at least one student</li>
        </ul>
      </div>
    </div>
  );
};

export default PromotionsComponent;