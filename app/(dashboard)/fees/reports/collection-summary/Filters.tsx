// components/fees/reports/Filters.tsx
'use client';

import { useEffect, useState } from "react";
import Select from "react-select";
import { CollectionFilters } from "@/actions/fees/reports/actions";
import {
  AcademicYear,
  Term,
  getAcademicYears,
  getTermsByAcademicYear,
} from "@/actions/fees/reports/data-fetching";

interface FiltersProps {
  onFilterChange: (filters: CollectionFilters) => void;
}

export function Filters({ onFilterChange }: FiltersProps) {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected values state
  const [selectedStartDate, setSelectedStartDate] = useState<string>('');
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<any>(null);
  const [selectedTerm, setSelectedTerm] = useState<any>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const years = await getAcademicYears();
        setAcademicYears(years);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchTerms = async () => {
      if (selectedAcademicYear?.value) {
        try {
          const termsData = await getTermsByAcademicYear(selectedAcademicYear.value);
          setTerms(termsData);
        } catch (error) {
          console.error('Error fetching terms:', error);
        }
      } else {
        setTerms([]);
      }
    };

    fetchTerms();
  }, [selectedAcademicYear]);

  const handleFilter = () => {
    const filters: CollectionFilters = {
      startDate: selectedStartDate || undefined,
      endDate: selectedEndDate || undefined,
      academicYearId: selectedAcademicYear?.value || undefined,
      termId: selectedTerm?.value || undefined,
    };

    onFilterChange(filters);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={selectedStartDate}
            onChange={(e) => setSelectedStartDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={selectedEndDate}
            onChange={(e) => setSelectedEndDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Academic Year
          </label>
          <Select
            value={selectedAcademicYear}
            onChange={(option) => {
              setSelectedAcademicYear(option);
              setSelectedTerm(null);
            }}
            options={academicYears.map(year => ({
              value: year.id,
              label: year.year.toString()
            }))}
            isClearable
            className="basic-select"
            classNamePrefix="select"
            placeholder="Select Academic Year"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Term
          </label>
          <Select
            value={selectedTerm}
            onChange={(option) => setSelectedTerm(option)}
            options={terms.map(term => ({
              value: term.id,
              label: term.name
            }))}
            isClearable
            isDisabled={!selectedAcademicYear}
            className="basic-select"
            classNamePrefix="select"
            placeholder="Select Term"
          />
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={handleFilter}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}