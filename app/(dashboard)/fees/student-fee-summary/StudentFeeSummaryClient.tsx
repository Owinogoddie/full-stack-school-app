'use client';

import { useState } from 'react';
import StudentFeeSummaryModal from './_components/StudentFeeSummaryModal';
import StudentFeeSummaryTable from './_components/StudentFeeSummaryTable';

export interface InitialData {
    academicYears: { id: number; year: string }[];
    grades: { id: number; name: string }[];
    feeTypes: { id: string; name: string }[];
}

export interface SelectedParams {
    academicYearId: number;
    termId: string;
    gradeId?: number;
    classId?: number;
    feeTypeIds: string[];
}

export default function StudentFeeSummaryClient({ initialData }: { initialData: InitialData }) {
    const [showModal, setShowModal] = useState(true);
    const [selectedParams, setSelectedParams] = useState<SelectedParams | null>(null);

    const handleModalSubmit = (params: SelectedParams) => {
        setSelectedParams({
            ...params,
            feeTypeIds: params.feeTypeIds || [] 
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
                <h1 className="text-2xl font-bold text-gray-800">Student Fee Summary</h1>
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
                <StudentFeeSummaryModal
                    initialData={initialData}
                    onSubmit={handleModalSubmit}
                />
            ) : selectedParams ? (
                <StudentFeeSummaryTable params={selectedParams} />
            ) : null}
        </div>
    );
}
