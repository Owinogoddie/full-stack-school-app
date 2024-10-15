import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'

export default function FeeDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Fee Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Collected" value="$125,000" change="+5.4%" increase />
        <StatCard title="Pending Payments" value="$23,500" change="-2.1%" increase={false} />
        <StatCard title="Active Students" value="1,234" change="+3.2%" increase />
        <StatCard title="Overdue Fees" value="$7,800" change="+0.8%" increase={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          {/* Add a table or list of recent transactions here */}
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Fee Collection Trend</h2>
          {/* Add a chart or graph here */}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, change, increase }: { title: string; value: string; change: string; increase: boolean }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-semibold mt-1">{value}</p>
      <p className={`text-sm font-medium ${increase ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
        {increase ? <ArrowTrendingUpIcon className="w-4 h-4 mr-1" /> : <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />}
        {change}
      </p>
    </div>
  )
}