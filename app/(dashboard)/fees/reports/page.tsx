// app/fees/reports/page.tsx
import Link from 'next/link'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline'

const reports = [
  {
    title: 'Collection Summary',
    description: 'Overview of fee collection for all classes',
    icon: CurrencyDollarIcon,
    href: '/fees/reports/collection-summary',
    color: 'bg-blue-500',
  },
  {
    title: 'Outstanding Fees',
    description: 'List of students with pending fee payments',
    icon: UserGroupIcon,
    href: '/fees/reports/outstanding',
    color: 'bg-red-500',
  },
  {
    title: 'Payment Trends',
    description: 'Analysis of fee payment patterns over time',
    icon: ArrowTrendingUpIcon,
    href: '/fees/reports/trends',
    color: 'bg-green-500',
  },
  {
    title: 'Fee Type Breakdown',
    description: 'Distribution of collected fees by fee type',
    icon: ChartBarIcon,
    href: '/fees/reports/fee-types',
    color: 'bg-purple-500',
  },
  {
    title: 'Class-wise Collection',
    description: 'Comparison of fee collection across different classes',
    icon: DocumentChartBarIcon,
    href: '/fees/reports/class-wise',
    color: 'bg-yellow-500',
  },
  {
    title: 'Yearly Comparison',
    description: 'Year-over-year comparison of fee collection',
    icon: ClockIcon,
    href: '/fees/reports/yearly',
    color: 'bg-indigo-500',
  },
]

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Fee Reports</h1>
          <p className="mt-2 text-sm text-gray-600">
            Generate comprehensive reports for fee management and analysis
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Link
              key={report.title}
              href={report.href}
              className="group relative bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${report.color} bg-opacity-10`}>
                  <report.icon className={`w-6 h-6 ${report.color.replace('bg-', 'text-')}`} />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {report.title}
                  </h3>
                  <p className="text-sm text-gray-500">{report.description}</p>
                </div>
              </div>
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}