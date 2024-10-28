// app/fee-structures/_components/FeeStructureFilter.tsx
'use client';

import Select from 'react-select';
import { useState, useEffect } from 'react';

interface FilterProps {
  initialData: {
    academicYears: { id: number; year: string }[];
    terms: { id: string; name: string }[];
    grades: { id: number; levelName: string }[];
    classes: { id: number; name: string; gradeId: number }[];
    studentCategories: { id: string; name: string }[];
    specialProgrammes: { id: string; name: string; description: string | null }[];
  };
  onFilter: (filters: any) => void;
}

export default function FeeStructureFilter({ initialData, onFilter }: FilterProps) {
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<any>(null);
  const [selectedTerm, setSelectedTerm] = useState<any>(null);
  const [selectedGrade, setSelectedGrade] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [filteredClasses, setFilteredClasses] = useState(initialData.classes);

  useEffect(() => {
    if (selectedGrade) {
      setFilteredClasses(
        initialData.classes.filter(c => c.gradeId === selectedGrade.value)
      );
    } else {
      setFilteredClasses(initialData.classes);
    }
  }, [selectedGrade, initialData.classes]);

  const handleFilter = () => {
    const filters = {
      academicYearId: selectedAcademicYear?.value,
      termId: selectedTerm?.value,
      gradeIds: selectedGrade ? [selectedGrade.value] : undefined,
      classIds: selectedClass ? [selectedClass.value] : undefined,
      studentCategoryIds: selectedCategory ? [selectedCategory.value] : undefined,
      specialProgrammeIds: selectedProgram ? [selectedProgram.value] : undefined,
    };
    onFilter(filters);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Academic Year
          </label>
          <Select
            value={selectedAcademicYear}
            onChange={(option) => setSelectedAcademicYear(option)}
            options={initialData.academicYears.map(year => ({
              value: year.id,
              label: year.year
            }))}
            isClearable
            className="basic-select"
            classNamePrefix="select"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Term
          </label>
          <Select
            value={selectedTerm}
            onChange={(option) => setSelectedTerm(option)}
            options={initialData.terms.map(term => ({
              value: term.id,
              label: term.name
            }))}
            isClearable
            className="basic-select"
            classNamePrefix="select"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Grade
          </label>
          <Select
            value={selectedGrade}
            onChange={(option) => {
              setSelectedGrade(option);
              setSelectedClass(null);
            }}
            options={initialData.grades.map(grade => ({
              value: grade.id,
              label: grade.levelName
            }))}
            isClearable
            className="basic-select"
            classNamePrefix="select"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class
          </label>
          <Select
            value={selectedClass}
            onChange={(option) => setSelectedClass(option)}
            options={filteredClasses.map(cls => ({
              value: cls.id,
              label: cls.name
            }))}
            isClearable
            isDisabled={!selectedGrade}
            className="basic-select"
            classNamePrefix="select"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Student Category
          </label>
          <Select
            value={selectedCategory}
            onChange={(option) => setSelectedCategory(option)}
            options={initialData.studentCategories.map(category => ({
              value: category.id,
              label: category.name
            }))}
            isClearable
            className="basic-select"
            classNamePrefix="select"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Programme
          </label>
          <Select
            value={selectedProgram}
            onChange={(option) => setSelectedProgram(option)}
            options={initialData.specialProgrammes.map(program => ({
              value: program.id,
              label: program.name
            }))}
            isClearable
            className="basic-select"
            classNamePrefix="select"
          />
        </div>

        <button
          onClick={handleFilter}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}