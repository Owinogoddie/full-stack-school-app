// app/fees/reports/components/FeeTypeDistribution.tsx
'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'

const dummyData = [
  { name: 'Tuition Fee', value: 60 },
  { name: 'Development Fee', value: 15 },
  { name: 'Transportation Fee', value: 10 },
  { name: 'Laboratory Fee', value: 8 },
  { name: 'Other Fees', value: 7 },
]

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899']

export function FeeTypeDistribution() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Fee Type Distribution
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dummyData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {dummyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}