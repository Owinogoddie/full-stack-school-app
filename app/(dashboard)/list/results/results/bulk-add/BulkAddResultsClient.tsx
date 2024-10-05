'use client';

import { useState } from 'react';
import BulkResultsModal from '../_components/BulkResultsModal';
import BulkResultsForm from '../_components/BulkResultsForm';

interface RelatedData {
  exams: { id: number; title: string }[];
  subjects: { id: number; name: string }[];
  academicYears: { id: number; year: string }[];
  classes: { id: number; name: string }[];
  gradeScales: { id: number; name: string }[];
}

interface SelectedParams {
  examId: number;
  subjectId: number;
  academicYearId: number;
  classId: number;
  gradeScaleId: number;
}

export default function BulkAddResultsClient({ relatedData }: { relatedData: RelatedData }) {
  const [showModal, setShowModal] = useState(true);
  const [selectedParams, setSelectedParams] = useState<SelectedParams | null>(null);

  const handleModalSubmit = (params: SelectedParams) => {
    setSelectedParams(params);
    setShowModal(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bulk Add Results</h1>
      {showModal ? (
        <BulkResultsModal
          relatedData={relatedData}
          onSubmit={handleModalSubmit}
        />
      ) : selectedParams ? (
        <BulkResultsForm {...selectedParams} />
      ) : null}
    </div>
  );
}