// app/fees/reports/components/GradeWiseCollection.tsx
'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const dummyData = [
  {
    grade: 'Grade 9',
    collected: 45000,
    pending: 5000,
    collectionRate: 90,
  },
  {
    grade: 'Grade 10',
    collected: 52000,
    pending: 8000,
    collectionRate: 87,
  },
  // ... add more grades
]

export function GradeWiseCollection() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Grade-wise Collection Analysis
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dummyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="grade" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar 
              yAxisId="left"
              dataKey="collected" 
              fill="#3b82f6" 
              name="Collected"
            />
            <Bar 
              yAxisId="left"
              dataKey="pending" 
              fill="#ef4444" 
              name="Pending"
            />
            <Bar
              yAxisId="right"
              dataKey="collectionRate"
              fill="#10b981"
              name="Collection Rate (%)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}