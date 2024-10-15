import Link from 'next/link'

export default function Transactions() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Fee Transactions</h1>
      <div className="mb-4 flex justify-between items-center">
        <input type="text" placeholder="Search transactions..." className="border rounded px-4 py-2" />
        <Link href="/fees/transactions/new" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Record Payment
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
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