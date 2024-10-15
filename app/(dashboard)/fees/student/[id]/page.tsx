'use client';

import React, { useEffect, useState } from 'react';

// Types
interface FeeItem {
  id: number;
  feeTypeId: number;
  amount: number;
  finalAmount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'PARTIALLY_PAID';
}

interface Payment {
  id: number;
  amount: number;
  paymentDate: string;
  method: string;
  status: string;
}

export default function StudentFeesPage({ params }: { params: { id: string } }) {
  const [feeItems, setFeeItems] = useState<FeeItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    // Fetch fee items
    fetch(`/api/studentFees/${params.id}`)
      .then(res => res.json())
      .then(setFeeItems);

    // Fetch payments
    fetch(`/api/studentPayments/${params.id}`)
      .then(res => res.json())
      .then(setPayments);
  }, [params.id]);

  const totalFees = feeItems.reduce((sum, item) => sum + item.finalAmount, 0);
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const balance = totalFees - totalPaid;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Student Fees - ID: {params.id}</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Fee Summary</h2>
        <div className="bg-white rounded-lg shadow p-4">
          <p>Total Fees: ${totalFees}</p>
          <p>Total Paid: ${totalPaid}</p>
          <p className="font-bold">Balance: ${balance}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Fee Items</h2>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feeItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{item.feeTypeId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${item.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${item.finalAmount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.dueDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Payment History</h2>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">${payment.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{payment.paymentDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{payment.method}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{payment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}