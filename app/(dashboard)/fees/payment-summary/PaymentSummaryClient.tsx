// app/(dashboard)/fees/payment-summary/PaymentSummaryClient.tsx
'use client';

import { useState } from 'react';
import FullScreenLoader from '@/components/full-screen-loader';
import { getPaymentSummary } from '@/actions/fees/payment-summary';
import PaymentSummaryModal from './_components/PaymentSummaryModal';
import PaymentSummaryTable from './_components/PaymentSummaryTable';
import toast from 'react-hot-toast';

export interface InitialData {
  academicYears: { id: number; year: string }[];
  grades: { id: number; name: string }[];
  feeStructures: { id: string; name: string; amount: number }[];
}

export interface SelectedParams {
  academicYearId: number;
  termId: string;
  gradeId?: number;
  classId?: number;
  feeStructureIds: string[];
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  paymentStatus: 'ALL' | 'PENDING' | 'PARTIAL' | 'COMPLETED' | 'OVERDUE';
  paymentType: 'ALL' | 'CASH' | 'BANK' | 'MOBILE_MONEY';
}

interface Props {
  initialData: InitialData;
}

export default function PaymentSummaryClient({ initialData }: Props) {
  const [showModal, setShowModal] = useState(true);
  const [, setSelectedParams] = useState<SelectedParams | null>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(1);
  const handleModalSubmit = async (params: SelectedParams) => {
    setLoading(true);
    try {
      const data = await getPaymentSummary(params);
      setSummaryData(data);
      setSelectedParams(params);
      setShowModal(false);
    } catch (error) {
      console.error('Failed to fetch payment summary:', error);
      toast.error("Failed to fetch payment summary")
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedParams(null);
    setSummaryData(null);
    setShowModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Payment Summary</h1>
        {!showModal && (
          <button
            onClick={handleReset}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
          >
            Change Filters
          </button>
        )}
      </div>

      {loading && <FullScreenLoader />}

      {showModal ? (
        <PaymentSummaryModal
          initialData={initialData}
          onSubmit={handleModalSubmit}
        />
      ) : summaryData ? (
        <PaymentSummaryTable 
          data={summaryData}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      ) : null}
    </div>
  );
}