// app/(dashboard)/fees/student-fee-summary/_components/StudentFeeSummaryTable.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  StudentFeeSummary,
  getStudentFeeSummary,
} from "@/actions/fee/fee-summary";
import FullScreenLoader from "@/components/full-screen-loader";
import Link from "next/link";

interface StudentFeeSummaryTableProps {
  params: {
    academicYearId: number;
    termId: string;
    gradeId?: number;
    classId?: number;
    feeTypeIds: string[];
  };
}

export default function StudentFeeSummaryTable({
  params,
}: StudentFeeSummaryTableProps) {
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<StudentFeeSummary[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const data = await getStudentFeeSummary(params);
        setSummaries(data);
      } catch (error) {
        console.error("Failed to fetch summaries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, [params]);

  const toggleRow = (studentId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }
    setExpandedRows(newExpanded);
  };

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!summaries.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No student fee records found
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-8"></th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Student
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Expected
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Exemptions
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actual Paid
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Balance
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Credit
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Extra Fees
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {summaries.map((summary) => (
            <React.Fragment key={summary.studentId}>
              <tr className="hover:bg-gray-50">
                <td className="pl-4">
                  <button
                    onClick={() => toggleRow(summary.studentId)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {expandedRows.has(summary.studentId) ? (
                      <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5" />
                    )}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {summary.firstName} {summary.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {summary.admissionNumber}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatCurrency(summary.totalExpected)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatCurrency(summary.totalExemptions)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatCurrency(summary.actualPaid)}
                </td>
                <td className="px-6 py-4 text-sm">
                  {summary.balance > 0 ? (
                    <span className="text-red-600 font-medium">
                      {formatCurrency(summary.balance)}
                    </span>
                  ) : (
                    formatCurrency(0)
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  {summary.creditBalance > 0 ? (
                    <span className="text-green-600 font-medium">
                      {formatCurrency(summary.creditBalance)}
                    </span>
                  ) : (
                    formatCurrency(0)
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                    {summary.extraFees > 0 ? (
                      <span className="text-orange-600 font-medium">
                        {formatCurrency(summary.extraFees)}
                      </span>
                    ) : (
                      formatCurrency(0)
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link
                      href={`/fees/student-transactions/${summary.studentId}?academicYearId=${params.academicYearId}&termId=${params.termId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      View Transactions
                    </Link>
                  </td>
              </tr>
              {expandedRows.has(summary.studentId) && (
                <tr>
                  <td colSpan={7} className="bg-gray-50 px-8 py-4">
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">
                        Fee Breakdown
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        {summary.feeBreakdown.map((fee) => (
                          <div
                            key={fee.feeTypeId}
                            className="border rounded-lg p-4 bg-white"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium text-gray-900">
                                  {fee.feeTypeName}
                                </h5>
                                <p className="text-sm text-gray-500">
                                  Expected: {formatCurrency(fee.amount)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Paid: {formatCurrency(fee.paid)}
                                </p>
                              </div>
                              {fee.exemptions.length > 0 && (
                                <div className="text-right">
                                  <h6 className="text-sm font-medium text-gray-900">
                                    Exemptions:
                                  </h6>
                                  {fee.exemptions.map((exemption, idx) => (
                                    <p
                                      key={idx}
                                      className="text-sm text-gray-500"
                                    >
                                      {exemption.type} (
                                      {exemption.adjustmentType === "PERCENTAGE"
                                        ? "%"
                                        : "Fixed"}
                                      ): {formatCurrency(exemption.amount)}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="mt-2 pt-2 border-t flex justify-between items-center">
                              <div>
                                <p className="text-sm font-medium">
                                  Total Exemptions:{" "}
                                  <span className="text-gray-600">
                                    {formatCurrency(
                                      fee.exemptions.reduce(
                                        (sum, e) => sum + e.amount,
                                        0
                                      )
                                    )}
                                  </span>
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  Balance:{" "}
                                  {fee.balance > 0 ? (
                                    <span className="text-red-600">
                                      {formatCurrency(fee.balance)}
                                    </span>
                                  ) : (
                                    <span className="text-green-600">
                                      {formatCurrency(0)}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                  
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
