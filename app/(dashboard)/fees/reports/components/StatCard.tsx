// components/fees/reports/StatCard.tsx
interface StatCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ElementType;
    colorClass: string;
  }
  
  export function StatCard({ title, value, change, icon: Icon, colorClass }: StatCardProps) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {change !== undefined && (
              <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}{change}% from last month
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }