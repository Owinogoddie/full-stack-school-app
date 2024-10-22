// app/fees/reports/components/CollectionTrends.tsx
'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const dummyData = [
  { month: 'Jan', collected: 45000, expected: 50000 },
  { month: 'Feb', collected: 48000, expected: 50000 },
  { month: 'Mar', collected: 52000, expected: 50000 },
  // ... add more months
]

export function CollectionTrends() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Fee Collection Trends</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dummyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="collected" 
              stroke="#3b82f6" 
              name="Collected"
            />
            <Line 
              type="monotone" 
              dataKey="expected" 
              stroke="#ef4444" 
              name="Expected"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
