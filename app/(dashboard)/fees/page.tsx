import Link from 'next/link'
import { 
  HomeIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon,
  CreditCardIcon,
  ChartBarIcon,
  CogIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'

const menuItems = [
  { name: 'Dashboard', icon: HomeIcon, href: '/fees/dashboard' },
  { name: 'Fee Types', icon: CurrencyDollarIcon, href: '/fees/types' },
  { name: 'Student Fees', icon: UserGroupIcon, href: '/fees/student-fees' },
  { name: 'Fee Templates', icon: ClipboardDocumentListIcon, href: '/fees/templates' },
  { name: 'Transactions', icon: CreditCardIcon, href: '/fees/transactions' },
  { name: 'Reports', icon: ChartBarIcon, href: '/fees/reports' },
  { name: 'Fee Settings', icon: CogIcon, href: '/fees/settings' },
]

export default function FeesMenuPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Fee Management</h1>
          
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center p-4 bg-white rounded-lg shadow-xs hover:bg-blue-100 transition-colors duration-150 ease-in-out"
                  >
                    <div className="p-3 mr-4 text-blue-500 bg-blue-100 rounded-full">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-900">{item.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
              <div className="p-6 bg-white border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <QuickStat title="Total Fees Collected" value="$125,000" trend="+5.4%" />
                  <QuickStat title="Pending Payments" value="$23,500" trend="-2.1%" trendDown />
                  <QuickStat title="Active Students" value="1,234" trend="+3.2%" />
                  <QuickStat title="Overdue Fees" value="$7,800" trend="+0.8%" trendDown />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function QuickStat({ title, value, trend, trendDown = false }: { title: string; value: string; trend: string; trendDown?: boolean }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-1 flex items-baseline justify-between">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className={`text-sm font-medium ${trendDown ? 'text-red-600' : 'text-green-600'} flex items-center`}>
          <ArrowTrendingUpIcon className={`w-4 h-4 mr-1 ${trendDown ? 'rotate-180' : ''}`} />
          {trend}
        </p>
      </div>
    </div>
  )
}