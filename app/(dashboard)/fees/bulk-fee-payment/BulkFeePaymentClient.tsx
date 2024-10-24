// app/bulk-fee-payment/BulkFeePaymentClient.tsx
'use client';

import { useState } from 'react';
import BulkFeePaymentModal from './_components/BulkFeePaymentModal';
import BulkFeePaymentForm from './_components/BulkFeePaymentForm';

export interface InitialData {
  academicYears: { id: number; year: string }[];
  terms: { id: string; name: string; academicYearId: number }[];
  grades: { id: number; name: string }[];
  classes: { id: number; name: string; gradeId: number }[];
  fees: {
    id: string;
    name: string;
    description: string | null;
    amount: number;
    academicYearId: number | null;
    termId: string | null;
    feeTypeId: string | null;
  }[];
}

export interface SelectedParams {
  academicYearId: number;
  termId: string;
  gradeId?: number;
  classIds: number[];
  feeIds: string[];
}

export default function BulkFeePaymentClient({
  initialData
}: {
  initialData: InitialData
}) {
  const [showModal, setShowModal] = useState(true);
  const [selectedParams, setSelectedParams] = useState<SelectedParams | null>(null);
  const [contextInfo, setContextInfo] = useState<{
    academicYear?: string;
    term?: string;
    grade?: string;
    classes?: string[];
    fees?: string[];
  }>({});

  const handleModalSubmit = (params: SelectedParams) => {
    setSelectedParams(params);
    setContextInfo({
      academicYear: initialData.academicYears.find(y => y.id === params.academicYearId)?.year,
      term: initialData.terms.find(t => t.id === params.termId)?.name,
      grade: params.gradeId ? initialData.grades.find(g => g.id === params.gradeId)?.name : undefined,
      classes: initialData.classes
        .filter(c => params.classIds.includes(c.id))
        .map(c => c.name),
      fees: initialData.fees
        .filter(f => params.feeIds.includes(f.id))
        .map(f => f.name)
    });
    setShowModal(false);
  };

  const handleReset = () => {
    setSelectedParams(null);
    setShowModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        {!showModal && (
          <button
            onClick={handleReset}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
          >
            Change Selection
          </button>
        )}
      </div>

      {showModal ? (
        <BulkFeePaymentModal
          initialData={initialData}
          onSubmit={handleModalSubmit}
        />
      ) : selectedParams ? (
        <BulkFeePaymentForm
          params={selectedParams}
          {...contextInfo}
        />
      ) : null}
    </div>
  );
}