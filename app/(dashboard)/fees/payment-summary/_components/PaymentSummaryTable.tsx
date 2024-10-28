"use client";

import React, { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import EditPaymentModal from "./EditPaymentModal";
import PaginationControls from "@/components/PaginationControls";

export interface ExcessFeeDetails {
  id: string;
  amount: number;
  isUsed: boolean;
  createdAt: Date;
  description?: string;
}
export interface PaymentDetails {
  id: string;
  amount: number;
  paymentDate: Date;
  paymentType: string;
  status: string;
  reference?: string;
  hasExcessFee: boolean;
  excessAmount: number;
  generatedExcessFee: ExcessFeeDetails | null;
}

export interface FeeStructureDetails {
  id: string;
  name: string;
  amount: number;
  paid: number;
  balance: number;
  dueDate: Date;
  status: string;
  payments: PaymentDetails[];
}

export interface StudentPaymentSummary {
  studentId: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  totalExpected: number;
  totalPaid: number;
  balance: number;
  lastPaymentDate?: Date;
  feeStructures: FeeStructureDetails[];
  excessFees: {
    total: number;
    unusedTotal: number;
    details: ExcessFeeDetails[];
  };
}

interface Props {
  data: StudentPaymentSummary[];
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}
export interface EditablePayment extends PaymentDetails {
  description?: string;
}
export default function PaymentSummaryTable({ data, 
  currentPage, 
  itemsPerPage, 
  onPageChange, 
  onItemsPerPageChange  }: Props) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [editingPayment, setEditingPayment] = useState<EditablePayment | null>(
    null
  );

  const toggleRow = (studentId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }
    setExpandedRows(newExpanded);
  };
  const totalItems = data.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentData = data.slice(startIndex, endIndex);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };
  const renderExcessFeesBadge = (summary: StudentPaymentSummary) => {
    if (summary.excessFees.unusedTotal > 0) {
      return (
        <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
          Unused Excess: {formatCurrency(summary.excessFees.unusedTotal)}
        </span>
      );
    }
    return null;
  };
  return (
    <>
      {/* Desktop View (hidden on small screens) */}
      <div className="hidden sm:block overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total Expected
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total Paid
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Balance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Last Payment
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((summary) => (
              <React.Fragment key={summary.studentId}>
                {/* Main Row */}
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
                      {renderExcessFeesBadge(summary)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {summary.admissionNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatCurrency(summary.totalExpected)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatCurrency(summary.totalPaid)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`font-medium ${
                        summary.balance > 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {formatCurrency(summary.balance)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {summary.lastPaymentDate
                      ? format(new Date(summary.lastPaymentDate), "dd/MM/yyyy")
                      : "-"}
                  </td>
                </tr>

                {/* Expanded Row */}
                {expandedRows.has(summary.studentId) && (
                  <tr>
                    <td colSpan={6} className="bg-gray-50 px-8 py-4">
                      {/* Excess Fees Section */}
                      {summary.excessFees.details.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Excess Fees Summary
                          </h4>
                          <div className="bg-white p-4 rounded-lg border">
                            <div className="grid grid-cols-2 gap-4 mb-2">
                              <div>
                                <span className="text-sm text-gray-500">
                                  Total Excess:
                                </span>
                                <span className="ml-2 font-medium">
                                  {formatCurrency(summary.excessFees.total)}
                                </span>
                              </div>
                              <div>
                                <span className="text-sm text-gray-500">
                                  Unused Excess:
                                </span>
                                <span className="ml-2 font-medium text-green-600">
                                  {formatCurrency(
                                    summary.excessFees.unusedTotal
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2">
                              {summary.excessFees.details.map((excess) => (
                                <div
                                  key={excess.id}
                                  className="text-sm border-t pt-2 mt-2 flex justify-between"
                                >
                                  <div>
                                    <span className="text-gray-600">
                                      {format(
                                        new Date(excess.createdAt),
                                        "dd/MM/yyyy"
                                      )}
                                    </span>
                                    {excess.description && (
                                      <span className="text-gray-500 ml-2">
                                        ({excess.description})
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      {formatCurrency(excess.amount)}
                                    </span>
                                    <span
                                      className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                        excess.isUsed
                                          ? "bg-gray-100 text-gray-800"
                                          : "bg-green-100 text-green-800"
                                      }`}
                                    >
                                      {excess.isUsed ? "Used" : "Available"}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Fee Structures Section */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">
                          Fee Structure Details
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                          {summary.feeStructures.map((fee) => (
                            <div
                              key={fee.id}
                              className="border rounded-lg p-4 bg-white"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h5 className="font-medium text-gray-900">
                                    {fee.name}
                                  </h5>
                                  <p className="text-sm text-gray-500">
                                    Due Date:{" "}
                                    {format(
                                      new Date(fee.dueDate),
                                      "dd/MM/yyyy"
                                    )}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Status:{" "}
                                    <span
                                      className={`font-medium ${
                                        fee.status === "COMPLETED"
                                          ? "text-green-600"
                                          : fee.status === "PARTIAL"
                                          ? "text-yellow-600"
                                          : fee.status === "OVERDUE"
                                          ? "text-red-600"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      {fee.status}
                                    </span>
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-900">
                                    Expected: {formatCurrency(fee.amount)}
                                  </p>
                                  <p className="text-sm text-gray-900">
                                    Paid: {formatCurrency(fee.paid)}
                                  </p>
                                  <p className="text-sm font-medium">
                                    Balance:{" "}
                                    <span
                                      className={
                                        fee.balance > 0
                                          ? "text-red-600"
                                          : "text-green-600"
                                      }
                                    >
                                      {formatCurrency(fee.balance)}
                                    </span>
                                  </p>
                                </div>
                              </div>

                              {/* Payments Section */}
                              {fee.payments.length > 0 && (
                                <div className="mt-4 border-t pt-4">
                                  <h6 className="text-sm font-medium text-gray-900 mb-2">
                                    Payment History
                                  </h6>
                                  <div className="space-y-2">
                                    {fee.payments.map((payment) => (
                                      <div
                                        key={payment.id}
                                        className="flex justify-between text-sm items-center"
                                      >
                                        <div>
                                          <span className="text-gray-600">
                                            {format(
                                              new Date(payment.paymentDate),
                                              "dd/MM/yyyy"
                                            )}
                                          </span>
                                          <span className="text-gray-500 ml-2">
                                            ({payment.paymentType})
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">
                                            {formatCurrency(payment.amount)}
                                          </span>
                                          {payment.hasExcessFee && (
                                            <span className="text-green-600 text-xs">
                                              +
                                              {formatCurrency(
                                                payment.excessAmount
                                              )}{" "}
                                              excess
                                            </span>
                                          )}
                                          {payment.reference && (
                                            <span className="text-gray-500 ml-2">
                                              Ref: {payment.reference}
                                            </span>
                                          )}
                                          <button
                                            onClick={() =>
                                              setEditingPayment(payment)
                                            }
                                            className="ml-2 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                          >
                                            Edit
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
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
        <PaginationControls
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      </div>
      {/* Mobile View (visible only on small screens) */}
      <div className="sm:hidden space-y-4">
        {currentData.map((summary) => (
          <div
            key={summary.studentId}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            {/* Student Header Card */}
            <div className="p-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {summary.firstName} {summary.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {summary.admissionNumber}
                  </p>
                </div>
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
              </div>

              {/* Summary Stats */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-500">Expected</p>
                  <p className="font-medium">
                    {formatCurrency(summary.totalExpected)}
                  </p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-500">Paid</p>
                  <p className="font-medium">
                    {formatCurrency(summary.totalPaid)}
                  </p>
                </div>
                <div className="col-span-2 bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-500">Balance</p>
                  <p
                    className={`font-medium ${
                      summary.balance > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {formatCurrency(summary.balance)}
                  </p>
                </div>
              </div>

              {/* Excess Fees Badge */}
              {summary.excessFees.unusedTotal > 0 && (
                <div className="mt-2 bg-green-50 p-2 rounded-md">
                  <p className="text-sm text-green-800">
                    Unused Excess:{" "}
                    {formatCurrency(summary.excessFees.unusedTotal)}
                  </p>
                </div>
              )}
            </div>

            {/* Expanded Content */}
            {expandedRows.has(summary.studentId) && (
              <div className="p-4 bg-gray-50">
                {/* Excess Fees Section */}
                {summary.excessFees.details.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Excess Fees
                    </h4>
                    <div className="space-y-2">
                      {summary.excessFees.details.map((excess) => (
                        <div
                          key={excess.id}
                          className="bg-white p-3 rounded-md shadow-sm"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-600">
                                {format(
                                  new Date(excess.createdAt),
                                  "dd/MM/yyyy"
                                )}
                              </p>
                              {excess.description && (
                                <p className="text-sm text-gray-500">
                                  {excess.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {formatCurrency(excess.amount)}
                              </p>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  excess.isUsed
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {excess.isUsed ? "Used" : "Available"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fee Structures */}
                <div className="space-y-4">
                  {summary.feeStructures.map((fee) => (
                    <div
                      key={fee.id}
                      className="bg-white rounded-lg p-4 shadow-sm"
                    >
                      <div className="mb-3">
                        <h5 className="font-medium text-gray-900">
                          {fee.name}
                        </h5>
                        <p className="text-sm text-gray-500">
                          Due: {format(new Date(fee.dueDate), "dd/MM/yyyy")}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Expected</p>
                          <p className="font-medium">
                            {formatCurrency(fee.amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Paid</p>
                          <p className="font-medium">
                            {formatCurrency(fee.paid)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Balance</p>
                          <p
                            className={`font-medium ${
                              fee.balance > 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {formatCurrency(fee.balance)}
                          </p>
                        </div>
                      </div>

                      {/* Payment History */}
                      {fee.payments.length > 0 && (
                        <div className="border-t pt-3">
                          <h6 className="text-sm font-medium text-gray-900 mb-2">
                            Payments
                          </h6>
                          <div className="space-y-2">
                            {fee.payments.map((payment) => (
                              <div
                                key={payment.id}
                                className="bg-gray-50 p-2 rounded-md"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-sm text-gray-600">
                                      {format(
                                        new Date(payment.paymentDate),
                                        "dd/MM/yyyy"
                                      )}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {payment.paymentType}
                                      {payment.reference &&
                                        ` • Ref: ${payment.reference}`}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">
                                      {formatCurrency(payment.amount)}
                                    </p>
                                    {payment.hasExcessFee && (
                                      <p className="text-xs text-green-600">
                                        +{formatCurrency(payment.excessAmount)}{" "}
                                        excess
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => setEditingPayment(payment)}
                                  className="mt-2 w-full text-center text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 py-1 rounded"
                                >
                                  Edit Payment
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        <PaginationControls
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      </div>
      {editingPayment && (
        <EditPaymentModal
          isOpen={true}
          onClose={() => setEditingPayment(null)}
          payment={editingPayment}
        />
      )}
    </>
  );
}
