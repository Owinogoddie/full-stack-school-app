import React from 'react';
import Link from 'next/link';

// This would typically be fetched from the API
const feeStructure = [
  { id: 1, classId: '1', academicYear: '2024', termId: 'Term 1', feeTypeId: 1, studentCategoryId: 1, baseAmount: 5000 },
  { id: 2, classId: '1', academicYear: '2024', termId: 'Term 1', feeTypeId: 2, studentCategoryId: 1, baseAmount: 1000 },
  { id: 3, classId: '1', academicYear: '2024', termId: 'Term 1', feeTypeId: 1, studentCategoryId: 2, baseAmount: 7000 },
  { id: 4, classId: '2', academicYear: '2024', termId: 'Term 1', feeTypeId: 1, studentCategoryId: 1, baseAmount: 5500 },
];

export default function FeeStructurePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Fee Structure</h1>
      <Link href="/fees/structure/new" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4 inline-block">
        Add New Fee Structure
      </Link>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Term</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {feeStructure.map((fee) => (
              <tr key={fee.id}>
                <td className="px-6 py-4 whitespace-nowrap">{fee.classId}</td>
                <td className="px-6 py-4 whitespace-nowrap">{fee.academicYear}</td>
                <td className="px-6 py-4 whitespace-nowrap">{fee.termId}</td>
                <td className="px-6 py-4 whitespace-nowrap">{fee.feeTypeId}</td>
                <td className="px-6 py-4 whitespace-nowrap">{fee.studentCategoryId}</td>
                <td className="px-6 py-4 whitespace-nowrap">${fee.baseAmount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/fees/structure/edit/${fee.id}`} className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</Link>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}