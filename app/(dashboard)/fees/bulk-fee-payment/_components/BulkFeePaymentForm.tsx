"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import FullScreenLoader from "@/components/full-screen-loader";
import SearchField from "@/components/search-field";

import { format } from "date-fns";
import { getUnpaidFeesByGradeOrClass } from "@/actions/fees/get-unpaid-fees";
import { StudentFeeData } from "../types";
import { processBulkPayments } from "@/actions/fees/bulk-payment";


interface BulkFeePaymentFormProps {
  params: {
    academicYearId: number;
    termId: string;
    gradeId?: number;
    classIds: number[];
    feeStructureIds: string[];
  };
  academicYear?: string;
  term?: string;
  grade?: string;
  classes?: string[];
  fees?: string[];
}

export interface PaymentInput {
  studentId: string;
  amount: number;
  feestructureIds: string[];
  academicYearId: number;
  termId: string;
  useCreditBalance: boolean;
  paymentType: 'BANK' | 'MOBILE_MONEY' | 'CASH' | 'CHEQUE' | 'OTHER';
  referenceNumber: string;
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
  const [students, setStudents] = useState<StudentFeeData[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentFeeData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFees, setSelectedFees] = useState<Record<string, Set<string>>>({});
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [useExcessFees, setUseExcessFees] = useState<Record<string, boolean>>({});
  const [paymentTypes, setPaymentTypes] = useState<Record<string, string>>({});
const [referenceNumbers, setReferenceNumbers] = useState<Record<string, string>>({});

  const handleExcessFeesToggle = (studentId: string) => {
    setUseExcessFees(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));

    if (!useExcessFees[studentId]) {
      const student = students.find(s => s.student.id === studentId);
      if (student && student.feeSummary.availableExcessFees > 0) {
        setPaymentAmounts(prev => ({
          ...prev,
          [studentId]: student.feeSummary.availableExcessFees.toFixed(2)
        }));
      }
    }
  };

  useEffect(() => {
    if (students.length > 0) {
      const filtered = students.filter(
        (data) =>
          data.student.admissionNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          `${data.student.firstName} ${data.student.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const fetchUnpaidFees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUnpaidFeesByGradeOrClass({
        academicYearId: params.academicYearId,
        termId: params.termId,
        classIds: params.classIds,
        feeStructureIds: params.feeStructureIds
      });
      const transformedData: StudentFeeData[] = response.map(item => ({
        student: {
          ...item.student,
          class: item.student.class || "", // Convert undefined to empty string
          id: item.student.id,
          upi: item.student.upi,
          admissionNumber: item.student.admissionNumber,
          firstName: item.student.firstName,
          lastName: item.student.lastName,
          grade: item.student.grade,
          gender: item.student.gender,
          status: item.student.status,
          categories: item.student.categories,
          specialProgrammes: item.student.specialProgrammes
        },
        feeSummary: {
          totalOriginalAmount: item.feeSummary.totalOriginalAmount,
          totalApplicableAmount: item.feeSummary.totalApplicableAmount,
          totalPaidAmount: item.feeSummary.totalPaidAmount,
          totalRemainingAmount: item.feeSummary.totalRemainingAmount,
          availableExcessFees: item.feeSummary.availableExcessFees,
          finalRemainingAmount: item.feeSummary.finalRemainingAmount
        },
        unpaidFees: item.unpaidFees.map((fee:any) => ({
          feeStructureId: fee.feeStructureId,
          feeType: fee.feeType,
          originalAmount: fee.originalAmount,
          applicableAmount: fee.applicableAmount,
          paidAmount: fee.paidAmount,
          remainingAmount: fee.remainingAmount,
          dueDate: fee.dueDate.toString(), // Convert Date to string
          isOverdue: fee.isOverdue,
          hasException: fee.hasException,
          exception: fee.exception,
          status: fee.status
        }))
      }));

      setStudents(transformedData);
      setFilteredStudents(transformedData);

      // Initialize selected fees
      const initialSelectedFees: Record<string, Set<string>> = {};
      transformedData.forEach((studentData) => {
        initialSelectedFees[studentData.student.id] = new Set(
          studentData.unpaidFees.map(fee => fee.feeStructureId)
        );
      });
      setSelectedFees(initialSelectedFees)
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

  const handleFeeToggle = (studentId: string, feeStructureId: string) => {
    setSelectedFees((prev) => {
      const studentFees = new Set(prev[studentId]);
      if (studentFees.has(feeStructureId)) {
        studentFees.delete(feeStructureId);
        setPaymentAmounts((prev) => {
          const newAmounts = { ...prev };
          delete newAmounts[studentId];
          return newAmounts;
        });
      } else {
        studentFees.add(feeStructureId);
      }
      return { ...prev, [studentId]: studentFees };
    });
  };

  const handleAmountChange = (studentId: string, value: string) => {
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setPaymentAmounts((prev) => ({ ...prev, [studentId]: value }));
    }
  };

  const calculateTotalSelectedFees = (studentData: StudentFeeData) => {
    const selectedTotal = studentData.unpaidFees
      .filter((fee) => selectedFees[studentData.student.id]?.has(fee.feeStructureId))
      .reduce((sum, fee) => sum + fee.remainingAmount, 0);
    
    return useExcessFees[studentData.student.id]
      ? Math.max(selectedTotal - studentData.feeSummary.availableExcessFees, 0)
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
        feestructureIds: Array.from(selectedFees[studentId] || []),
        academicYearId: params.academicYearId,
        termId: params.termId,
        useCreditBalance: useExcessFees[studentId] || false,
        paymentType: paymentTypes[studentId] as 'BANK' | 'MOBILE_MONEY' | 'CASH' | 'CHEQUE' | 'OTHER',
        referenceNumber: referenceNumbers[studentId] || ''
      }));
  
      if (payments.length === 0) {
        toast.error("No valid payments to process");
        return;
      }
  
      const results = await processBulkPayments(payments);
      const successCount = results.filter(r => r.success).length;
  
      if (successCount === payments.length) {
        toast.success("All payments processed successfully");
        // Reset form
        setPaymentAmounts({});
        setUseExcessFees({});
        setSelectedFees({});
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
                    Unpaid Fees
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Selected
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Excess Fees
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  Payment Type
</th>
<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  Reference
</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((studentData) => (
                  <tr key={studentData.student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {studentData.student.firstName} {studentData.student.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {studentData.student.admissionNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          {studentData.student.grade} - {studentData.student.class}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {studentData.unpaidFees.map((fee) => (
                          <div key={fee.feeStructureId}>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={selectedFees[studentData.student.id]?.has(fee.feeStructureId)}
                                onChange={() => handleFeeToggle(studentData.student.id, fee.feeStructureId)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm">
                                {fee.feeType} (Balance: {fee.remainingAmount.toFixed(2)})
                                {fee.hasException && (
                                  <span className="text-green-600 ml-2">
                                    {fee.exception?.reason}
                                  </span>
                                )}
                                {fee.isOverdue && (
                                  <span className="text-red-600 ml-2">
                                    Overdue: {format(new Date(fee.dueDate), 'dd/MM/yyyy')}
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
                        {calculateTotalSelectedFees(studentData).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={useExcessFees[studentData.student.id] || false}
                          onChange={() => handleExcessFeesToggle(studentData.student.id)}
                          disabled={studentData.feeSummary.availableExcessFees === 0}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-900">
                          {studentData.feeSummary.availableExcessFees.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
  <select
    value={paymentTypes[studentData.student.id] || ''}
    onChange={(e) => setPaymentTypes(prev => ({
      ...prev,
      [studentData.student.id]: e.target.value
    }))}
    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
              focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
  >
    <option value="">Select Type</option>
    <option value="BANK">Bank</option>
    <option value="MOBILE_MONEY">Mobile Money</option>
    <option value="CASH">Cash</option>
    <option value="CHECK">Check</option>
    <option value="OTHER">Other</option>
  </select>
</td>
<td className="px-6 py-4 whitespace-nowrap">
  <input
    type="text"
    value={referenceNumbers[studentData.student.id] || ''}
    onChange={(e) => setReferenceNumbers(prev => ({
      ...prev,
      [studentData.student.id]: e.target.value
    }))}
    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
              focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    placeholder="Enter reference"
  />
</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={paymentAmounts[studentData.student.id] || ""}
                        onChange={(e) => handleAmountChange(studentData.student.id, e.target.value)}
                        disabled={useExcessFees[studentData.student.id]}
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
  {filteredStudents.map((studentData) => (
    <div key={studentData.student.id} className="bg-white rounded-lg shadow-md p-4">
      {/* Student Header */}
      <div className="border-b pb-3 mb-3">
        <h3 className="text-lg font-medium text-gray-900">
          {studentData.student.firstName} {studentData.student.lastName}
        </h3>
        <div className="text-sm text-gray-500">
          <p>Admission: {studentData.student.admissionNumber}</p>
          <p>{studentData.student.grade} - {studentData.student.class}</p>
        </div>
      </div>

      {/* Unpaid Fees Section */}
      <div className="space-y-3 mb-4">
        <h4 className="font-medium text-gray-700">Unpaid Fees</h4>
        {studentData.unpaidFees.map((fee) => (
          <div key={fee.feeStructureId} className="flex items-start space-x-2 bg-gray-50 p-2 rounded">
            <input
              type="checkbox"
              checked={selectedFees[studentData.student.id]?.has(fee.feeStructureId)}
              onChange={() => handleFeeToggle(studentData.student.id, fee.feeStructureId)}
              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">{fee.feeType}</p>
              <p className="text-sm text-gray-600">Balance: {fee.remainingAmount.toFixed(2)}</p>
              {fee.hasException && (
                <p className="text-sm text-green-600">{fee.exception?.reason}</p>
              )}
              {fee.isOverdue && (
                <p className="text-sm text-red-600">
                  Overdue: {format(new Date(fee.dueDate), 'dd/MM/yyyy')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Total and Payment Section */}
      <div className="space-y-3 bg-gray-50 p-3 rounded">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Total Selected:</span>
          <span className="text-sm">{calculateTotalSelectedFees(studentData).toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={useExcessFees[studentData.student.id] || false}
              onChange={() => handleExcessFeesToggle(studentData.student.id)}
              disabled={studentData.feeSummary.availableExcessFees === 0}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Use Excess Fees ({studentData.feeSummary.availableExcessFees.toFixed(2)})</span>
          </label>
        </div>
        <div className="space-y-3">
  <div className="flex flex-col space-y-2">
    <label className="text-sm font-medium">Payment Type</label>
    <select
      value={paymentTypes[studentData.student.id] || ''}
      onChange={(e) => setPaymentTypes(prev => ({
        ...prev,
        [studentData.student.id]: e.target.value
      }))}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                focus:ring-blue-500 focus:border-blue-500 text-sm"
    >
      <option value="">Select Type</option>
      <option value="BANK">Bank</option>
      <option value="MOBILE_MONEY">Mobile Money</option>
      <option value="CASH">Cash</option>
      <option value="CHECK">Check</option>
      <option value="OTHER">Other</option>
    </select>
  </div>

  <div className="flex flex-col space-y-2">
    <label className="text-sm font-medium">Reference Number</label>
    <input
      type="text"
      value={referenceNumbers[studentData.student.id] || ''}
      onChange={(e) => setReferenceNumbers(prev => ({
        ...prev,
        [studentData.student.id]: e.target.value
      }))}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                focus:ring-blue-500 focus:border-blue-500 text-sm"
      placeholder="Enter reference"
    />
  </div>
</div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Payment Amount:</span>
          <input
            type="text"
            value={paymentAmounts[studentData.student.id] || ""}
            onChange={(e) => handleAmountChange(studentData.student.id, e.target.value)}
            disabled={useExcessFees[studentData.student.id]}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm
                     focus:ring-blue-500 focus:border-blue-500 text-sm
                     disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter amount"
          />
        </div>
      </div>
    </div>
  ))}
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