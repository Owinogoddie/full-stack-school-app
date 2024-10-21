// app/fee-structures/_components/FeeStructureDisplay.tsx
'use client';

import { useEffect, useState } from 'react';
import { getFeeStructure } from '@/actions/fee/fee-structure';
import ErrorDisplay from '@/components/ErrorDisplay';
import FullScreenLoader from '@/components/full-screen-loader';

interface GradeClass {
  gradeId: number;
  gradeName: string;
  classes: {
    id: number;
    name: string;
  }[];
}

interface FeeStructure {
  id: string;
  feeType: {
    name: string;
    description?: string;
  };
  baseAmount: number;
  gradeClasses: GradeClass[];
  studentCategories: string[];
  term: string;
  specialProgramme: string | null;
  effectiveDate: Date;
  version: number;
}

interface FeeStructureDisplayProps {
  params: {
    academicYearId: number;
    termId?: string;
    gradeId?: number;
    classId?: number;
    studentCategoryId?: string;
  };
}

export default function FeeStructureDisplay({ params }: FeeStructureDisplayProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getFeeStructure(params);
        setFeeStructures(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  if (loading) return <FullScreenLoader />;
  if (error) return <ErrorDisplay message={error} />;
  if (feeStructures.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-500 text-center">No fee structures found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {feeStructures.map((structure) => (
        <div key={structure.id} className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-semibold text-gray-700">Fee Type</h3>
              <p>{structure.feeType.name}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Base Amount</h3>
              <p>{structure.baseAmount.toLocaleString()}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Term</h3>
              <p>{structure.term}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Special Programme</h3>
              <p>{structure.specialProgramme || 'N/A'}</p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Grades & Classes</h3>
            <ul className="list-disc pl-5">
              {structure.gradeClasses.map((gc) => (
                <li key={gc.gradeId}>
                  {gc.gradeName}: {gc.classes.map((c) => c.name).join(', ')}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Student Categories</h3>
            <p>{structure.studentCategories.join(', ') || 'All Categories'}</p>
          </div>

          <div className="text-sm text-gray-500 mt-4">
            <p>Last updated: {new Date(structure.effectiveDate).toLocaleDateString()}</p>
            <p>Version: {structure.version}</p>
          </div>
        </div>
      ))}
    </div>
  );
}