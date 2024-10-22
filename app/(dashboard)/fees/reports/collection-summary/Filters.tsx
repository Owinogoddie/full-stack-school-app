// app/fees/reports/components/Filters.tsx
'use client';

import { AcademicYear, CollectionFilters, Grade, Term, getAcademicYears, getGrades, getTermsByAcademicYear } from '@/actions/fee/reports/actions';
import { useEffect, useState } from 'react';

interface FiltersProps {
  onFilterChange: (filters: CollectionFilters) => void;
}

export function Filters({ onFilterChange }: FiltersProps) {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedYear, setSelectedYear] = useState<number>();
  const [selectedTerm, setSelectedTerm] = useState<string>();
  const [selectedGrade, setSelectedGrade] = useState<number>();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [yearData, gradeData] = await Promise.all([
          getAcademicYears(),
          getGrades()
        ]);
        setAcademicYears(yearData);
        setGrades(gradeData);
      } catch (error) {
        console.error('Error loading filter data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      getTermsByAcademicYear(selectedYear)
        .then(termData => setTerms(termData))
        .catch(error => console.error('Error loading terms:', error));
    } else {
      setTerms([]);
      setSelectedTerm(undefined);
    }
  }, [selectedYear]);

  useEffect(() => {
    onFilterChange({
      academicYearId: selectedYear,
      termId: selectedTerm,
      gradeId: selectedGrade
    });
  }, [selectedYear, selectedTerm, selectedGrade, onFilterChange]);

  if (loading) return <div>Loading filters...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <select
        className="rounded-md border-gray-300 shadow-sm"
        value={selectedYear || ''}
        onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : undefined)}
      >
        <option value="">Select Academic Year</option>
        {academicYears.map(year => (
          <option key={year.id} value={year.id}>{year.year}</option>
        ))}
      </select>

      <select
        className="rounded-md border-gray-300 shadow-sm"
        value={selectedTerm || ''}
        onChange={(e) => setSelectedTerm(e.target.value || undefined)}
        disabled={!selectedYear}
      >
        <option value="">Select Term</option>
        {terms.map(term => (
          <option key={term.id} value={term.id}>{term.name}</option>
        ))}
      </select>

      <select
        className="rounded-md border-gray-300 shadow-sm"
        value={selectedGrade || ''}
        onChange={(e) => setSelectedGrade(e.target.value ? Number(e.target.value) : undefined)}
      >
        <option value="">Select Grade</option>
        {grades.map(grade => (
          <option key={grade.id} value={grade.id}>{grade.levelName}</option>
        ))}
      </select>
    </div>
  );
}