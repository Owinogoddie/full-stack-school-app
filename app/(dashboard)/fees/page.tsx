import Link from 'next/link'
import {
  HomeIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  ChartBarIcon,
  CogIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  UsersIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline'

const menuItems = [
  { 
    name: 'Dashboard', 
    icon: HomeIcon, 
    href: '/fees/dashboard',
    color: 'bg-blue-50 text-blue-600',
    description: 'Overview of fee statistics'
  },
  { 
    name: 'Fee Types', 
    icon: CurrencyDollarIcon, 
    href: '/fees/types',
    color: 'bg-purple-50 text-purple-600',
    description: 'Manage different fee categories'
  },
  { 
    name: 'Assign Fees ', 
    icon: BanknotesIcon, 
    href: '/fees/fee-structure',
    color: 'bg-green-50 text-green-600',
    description: 'Assign fees to clases, grades, etc'
  },
  { 
    name: 'Add Payments', 
    icon: CreditCardIcon, 
    href: '/fees/bulk-fee-payment',
    color: 'bg-pink-50 text-pink-600',
    description: 'Record new fee payments'
  },

  { 
    name: 'Fee Structures', 
    icon: ClipboardDocumentListIcon, 
    href: '/fees/structure',
    color: 'bg-yellow-50 text-yellow-600',
    description: 'Set up fee hierarchies'
  },
  { 
    name: 'Exceptions', 
    icon: ExclamationCircleIcon, 
    href: '/fees/exceptions',
    color: 'bg-red-50 text-red-600',
    description: 'Manage fee waivers and discounts'
  },
  { 
    name: 'Student Fees Summary', 
    icon: ClipboardDocumentListIcon, 
    href: '/fees/payment-summary',
    color: 'bg-indigo-50 text-indigo-600',
    description: 'Students Fees'
  },
  // { 
  //   name: 'Transactions', 
  //   icon: BanknotesIcon, 
  //   href: '/fees/transactions',
  //   color: 'bg-indigo-50 text-indigo-600',
  //   description: 'View all fee transactions'
  // },
 
  // { 
  //   name: 'Students Fee Summary', 
  //   icon: UsersIcon, 
  //   href: '/fees/student-fee-summary',
  //   color: 'bg-orange-50 text-orange-600',
  //   description: 'Individual student fee status'
  // },
  { 
    name: 'Reports', 
    icon: ChartBarIcon, 
    href: '/fees/reports',
    color: 'bg-teal-50 text-teal-600',
    description: 'Generate detailed fee reports'
  },
  { 
    name: 'Fee Settings', 
    icon: CogIcon, 
    href: '/fees/settings',
    color: 'bg-gray-50 text-gray-600',
    description: 'Configure fee management settings'
  },
]

export default function FeesMenuPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
              <p className="mt-1 text-sm text-gray-500">Manage your schools fee collection and tracking</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150">
              New Transaction
            </button>
          </div>

          {/* Quick Stats Section */}
          <div className="mb-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <QuickStat 
                title="Total Fees Collected" 
                value="$125,000" 
                trend="+5.4%" 
                icon={CurrencyDollarIcon}
                color="bg-green-500"
              />
              <QuickStat 
                title="Pending Payments" 
                value="$23,500" 
                trend="-2.1%" 
                trendDown 
                icon={ExclamationCircleIcon}
                color="bg-red-500"
              />
              <QuickStat 
                title="Active Students" 
                value="1,234" 
                trend="+3.2%" 
                icon={UsersIcon}
                color="bg-blue-500"
              />
              <QuickStat 
                title="Overdue Fees" 
                value="$7,800" 
                trend="+0.8%" 
                trendDown 
                icon={BanknotesIcon}
                color="bg-orange-500"
              />
            </div>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group relative bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${item.color}`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

function QuickStat({ 
  title, 
  value, 
  trend, 
  trendDown = false,
  icon: Icon,
  color
}: { 
  title: string
  value: string
  trend: string
  trendDown?: boolean
  icon: any
  color: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="mt-1 flex items-baseline justify-between">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              trendDown ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              <ArrowTrendingUpIcon 
                className={`w-3 h-3 mr-1 ${trendDown ? 'rotate-180' : ''}`} 
              />
              {trend}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}