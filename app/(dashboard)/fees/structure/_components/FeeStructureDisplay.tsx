// app/fee-structures/_components/FeeStructureDisplay.tsx
'use client';

import { FeeStructureWithRelations, getFeeStructures } from '@/actions/fees/get-fees-structures';
import { useEffect, useState } from 'react';

interface DisplayProps {
  params: {
    academicYearId?: number;
    termId?: string;
    gradeIds?: number[];
    classIds?: number[];
    studentCategoryIds?: string[];
    specialProgrammeIds?: string[];
  };
}

export default function FeeStructureDisplay({ params }: DisplayProps) {
  const [feeStructures, setFeeStructures] = useState<FeeStructureWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { feeStructures, error } = await getFeeStructures(params);
        if (error) {
          setError(error);
        } else if (feeStructures) {
          setFeeStructures(feeStructures);
        }
      } catch (err) {
        console.log(err)
        setError('Failed to fetch fee structures');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (feeStructures.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
        No fee structures found for the selected filters.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feeStructures.map((fee) => (
        <div
          key={fee.id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {fee.feeType.name}
              </h3>
              <p className="text-sm text-gray-500">
                {fee.academicYear.year} {fee.term?.name && `- ${fee.term.name}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-blue-600">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'KSH'
                }).format(fee.amount)}
              </p>
              <p className="text-sm text-gray-500">
                Due: {new Date(fee.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            {fee.grades.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Grades</h4>
                <div className="flex flex-wrap gap-2">
                  {fee.grades.map(grade => (
                    <span key={grade.id} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                      {grade.levelName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {fee.classes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Classes</h4>
                <div className="flex flex-wrap gap-2">
                  {fee.classes.map(cls => (
                    <span key={cls.id} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                      {cls.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {(fee.categories.length > 0 || fee.specialProgrammes.length > 0) && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {fee.categories.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {fee.categories.map(category => (
                      <span key={category.id} className="px-2 py-1 bg-blue-100 rounded-full text-sm">
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {fee.specialProgrammes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Special Programmes</h4>
                  <div className="flex flex-wrap gap-2">
                    {fee.specialProgrammes.map(program => (
                      <span key={program.id} className="px-2 py-1 bg-green-100 rounded-full text-sm">
                        {program.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}