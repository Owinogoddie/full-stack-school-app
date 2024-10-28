
// app/fee-structures/FeeStructureClient.tsx
'use client';

import { useState } from 'react';
import FeeStructureFilter from './_components/FeeStructureFilter';
import FeeStructureDisplay from './_components/FeeStructureDisplay';

interface InitialData {
  academicYears: { id: number; year: string }[];
  terms: { id: string; name: string }[];
  grades: { id: number; levelName: string }[];
  classes: { id: number; name: string; gradeId: number }[];
  studentCategories: { id: string; name: string }[];
  specialProgrammes:{id:string, name:string,description:string | null}[]
}

interface FilterParams {
  academicYearId: number;
  termId?: string;
  gradeIds?: number[];  
  classIds?: number[];  
  studentCategoryIds?: string[]; 
  specialProgrammeIds?: string[];
}

export default function FeeStructureClient({
  initialData,
}: {
  initialData: InitialData;
}) {
  const [filterParams, setFilterParams] = useState<FilterParams | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Fee Structures</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <FeeStructureFilter
            initialData={initialData}
            onFilter={setFilterParams}
          />
        </div>
        
        <div className="lg:col-span-8">
          {filterParams && <FeeStructureDisplay params={filterParams} />}
        </div>
      </div>
    </div>
  );
}
