import React from 'react';

// Dummy data
const assignedFees = [
  { id: 1, studentName: 'John Doe', grade: '1', category: 'Day Scholar', term: 'Term 1', totalFees: 6000 },
  { id: 2, studentName: 'Jane Smith', grade: '1', category: 'Boarder', term: 'Term 1', totalFees: 8000 },
  { id: 3, studentName: 'Mike Johnson', grade: '2', category: 'Day Scholar', term: 'Term 1', totalFees: 6500 },
  { id: 4, studentName: 'Sarah Williams', grade: '2', category: 'Boarder', term: 'Term 1', totalFees: 8500 },
];

export default function ViewAssignedFeesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Assigned Fees</h1>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Term</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Fees</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignedFees.map((fee) => (
              <tr key={fee.id}>
                <td className="px-6 py-4 whitespace-nowrap">{fee.studentName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{fee.grade}</td>
                <td className="px-6 py-4 whitespace-nowrap">{fee.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">{fee.term}</td>
                <td className="px-6 py-4 whitespace-nowrap">${fee.totalFees}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-2">View Details</button>
                  <button className="text-red-600 hover:text-red-900">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}