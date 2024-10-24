// app/bulk-fee-payment/_components/BulkFeePaymentForm.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import FullScreenLoader from "@/components/full-screen-loader";
import SearchField from "@/components/search-field";
import { getUnpaidFees } from "@/actions/fees/get-unpaid-fees";
import { processBulkPayment } from "@/actions/fees/bulk-payment";

interface BulkFeePaymentFormProps {
  params: {
    academicYearId: number;
    termId: string;
    gradeId?: number;
    classIds: number[];
    feeIds: string[];
  };
  academicYear?: string;
  term?: string;
  grade?: string;
  classes?: string[];
  fees?: string[];
}

export interface UnpaidFeeStudent {
  studentId: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  fees: {
    feeId: string;
    name: string;
    description: string | null;
    amount: number;
    paid: number;
    balance: number;
    exceptionInfo: string | null;
  }[];
  totalBalance: number;
  creditBalance: number;
}

interface PaymentInput {
  studentId: string;
  amount: number;
  feeIds: string[];
  academicYearId: number;
  termId: string;
  useCreditBalance: boolean;
}

export default function BulkFeePaymentForm({
  params,
  academicYear,
  term,
  grade,
  classes,
  fees,
}: BulkFeePaymentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<UnpaidFeeStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<UnpaidFeeStudent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFees, setSelectedFees] = useState<Record<string, Set<string>>>({});
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [useCreditBalance, setUseCreditBalance] = useState<Record<string, boolean>>({});

  const handleCreditBalanceToggle = (studentId: string) => {
    setUseCreditBalance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));

    if (!useCreditBalance[studentId]) {
      const student = students.find(s => s.studentId === studentId);
      if (student && student.creditBalance > 0) {
        setPaymentAmounts(prev => ({
          ...prev,
          [studentId]: student.creditBalance.toFixed(2)
        }));
      }
    }
  };

  useEffect(() => {
    if (students.length > 0) {
      const filtered = students.filter(
        (student) =>
          student.admissionNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          `${student.firstName} ${student.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const fetchUnpaidFees = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUnpaidFees({
        academicYearId: params.academicYearId,
        termId: params.termId,
        classIds: params.classIds,
        feeIds: params.feeIds
      });
      setStudents(data);
      setFilteredStudents(data);

      // Initialize selected fees
      const initialSelectedFees: Record<string, Set<string>> = {};
      data.forEach((student:any) => {
        initialSelectedFees[student.studentId] = new Set(
          student.fees.map((fee:any) => fee.feeId)
        );
      });
      setSelectedFees(initialSelectedFees);
    } catch (error) {
      toast.error("Failed to fetch unpaid fees");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchUnpaidFees();
  }, [fetchUnpaidFees]);

  const handleFeeToggle = (studentId: string, feeId: string) => {
    setSelectedFees((prev) => {
      const studentFees = new Set(prev[studentId]);
      if (studentFees.has(feeId)) {
        studentFees.delete(feeId);
        setPaymentAmounts((prev) => {
          const newAmounts = { ...prev };
          delete newAmounts[studentId];
          return newAmounts;
        });
      } else {
        studentFees.add(feeId);
      }
      return { ...prev, [studentId]: studentFees };
    });
  };
  const handleAmountChange = (studentId: string, value: string) => {
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setPaymentAmounts((prev) => ({ ...prev, [studentId]: value }));
    }
  };

  const calculateTotalSelectedFees = (student: UnpaidFeeStudent) => {
    const selectedTotal = student.fees
      .filter((fee) => selectedFees[student.studentId]?.has(fee.feeId))
      .reduce((sum, fee) => sum + fee.balance, 0);
    
    return useCreditBalance[student.studentId]
      ? Math.max(selectedTotal - student.creditBalance, 0)
      : selectedTotal;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (processing) return;

    try {
      setProcessing(true);

      const payments: PaymentInput[] = Object.entries(paymentAmounts)
        .filter(([, amount]) => amount && parseFloat(amount) > 0)
        .map(([studentId, amount]) => ({
          studentId,
          amount: parseFloat(amount),
          feeIds: Array.from(selectedFees[studentId] || []),
          academicYearId: params.academicYearId,
          termId: params.termId,
          useCreditBalance: useCreditBalance[studentId] || false,
        }));

      if (payments.length === 0) {
        toast.error("No valid payments to process");
        return;
      }

      const results = await processBulkPayment(payments);
      
      // Handle results array
      const successCount = results.filter((r:any) => r.success).length;
      if (successCount === payments.length) {
        toast.success("All payments processed successfully");
        router.refresh();
        await fetchUnpaidFees();
      } else if (successCount > 0) {
        toast.error(`${successCount} of ${payments.length} payments processed successfully`);
        await fetchUnpaidFees();
      } else {
        toast.error("Failed to process payments");
      }
    } catch (error) {
      toast.error("An error occurred while processing payments");
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <FullScreenLoader />;
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">
          No unpaid fees found for the selected criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section with Context */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold text-blue-800 mb-4">
          Fee Collection Management
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Academic Year:</span>
            <span className="ml-2 text-gray-800">{academicYear}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Term:</span>
            <span className="ml-2 text-gray-800">{term}</span>
          </div>
          {grade && (
            <div>
              <span className="font-medium text-gray-600">Grade:</span>
              <span className="ml-2 text-gray-800">{grade}</span>
            </div>
          )}
          <div className="col-span-full">
            <span className="font-medium text-gray-600">Classes:</span>
            <span className="ml-2 text-gray-800">{classes?.join(", ")}</span>
          </div>
          <div className="col-span-full">
            <span className="font-medium text-gray-600">Fees:</span>
            <span className="ml-2 text-gray-800">{fees?.join(", ")}</span>
          </div>
        </div>
      </div>

      {/* Search and Count Section */}
      <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
        <div className="flex flex-col md:flex-row gap-2 items-center">
          <SearchField
            value={searchTerm}
            onChange={(e: any) => setSearchTerm(e.target.value)}
            placeholder="Search by admission number or name..."
            className="w-full max-w-md"
          />
          <div className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-medium">{filteredStudents.length}</span> of{" "}
            <span className="font-medium">{students.length}</span> students with
            unpaid fees
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="hidden md:block">
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fees
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Selected
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credit Balance
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.studentId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.admissionNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {student.fees.map((fee) => (
                          <div key={fee.feeId}>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={selectedFees[student.studentId]?.has(fee.feeId)}
                                onChange={() => handleFeeToggle(student.studentId, fee.feeId)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm">
                                {fee.name} (Balance: {fee.balance.toFixed(2)})
                                {fee.exceptionInfo && (
                                  <span className="text-green-600 ml-2">
                                    {fee.exceptionInfo}
                                  </span>
                                )}
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {calculateTotalSelectedFees(student).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={useCreditBalance[student.studentId] || false}
                          onChange={() => handleCreditBalanceToggle(student.studentId)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-900">
                          {student.creditBalance.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={paymentAmounts[student.studentId] || ""}
                        onChange={(e) => handleAmountChange(student.studentId, e.target.value)}
                        disabled={useCreditBalance[student.studentId]}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm
                                 focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                                 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Enter amount"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile view cards */}
        <div className="md:hidden space-y-4">
          {/* Mobile cards implementation as before */}
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm
                     font-medium text-gray-700 bg-white hover:bg-gray-50
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={processing}
            className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm
                     font-medium text-white bg-blue-600 hover:bg-blue-700
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                     disabled:opacity-50 disabled:cursor-not-allowed
                     ${processing ? "opacity-75 cursor-not-allowed" : ""}`}
          >
            {processing ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              "Process Payments"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}