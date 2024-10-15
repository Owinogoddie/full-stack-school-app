import Link from 'next/link'

export default function StudentFees() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Student Fees</h1>
      <div className="mb-4 flex justify-between items-center">
        <input type="text" placeholder="Search students..." className="border rounded px-4 py-2" />
        <Link href="/fees/student-fees/assign" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Assign Fees
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Fees</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Add table rows here */}
          </tbody>
        </table>
      </div>
    </div>
  )
}