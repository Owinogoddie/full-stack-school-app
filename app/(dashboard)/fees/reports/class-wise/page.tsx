// app/fees/reports/class-wise/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, FaceSmileIcon } from '@heroicons/react/24/outline'
import { AdvancedFilters } from '../_components/AdvancedFilters'
import { GradeWiseCollection } from '../_components/GradeWiseCollection'

// TODO: Fetch from your API
const initialData = [
  {
    grade: 'Grade 9',
    collected: 450000,
    pending: 50000,
    collectionRate: 90,
    totalStudents: 120,
    paidStudents: 108,
    partialStudents: 8,
    defaulters: 4,
  },
  {
    grade: 'Grade 10',
    collected: 520000,
    pending: 80000,
    collectionRate: 87,
    totalStudents: 115,
    paidStudents: 98,
    partialStudents: 12,
    defaulters: 5,
  },
  {
    grade: 'Grade 11',
    collected: 480000,
    pending: 70000,
    collectionRate: 85,
    totalStudents: 110,
    paidStudents: 92,
    partialStudents: 10,
    defaulters: 8,
  },
  {
    grade: 'Grade 12',
    collected: 550000,
    pending: 45000,
    collectionRate: 92,
    totalStudents: 105,
    paidStudents: 96,
    partialStudents: 6,
    defaulters: 3,
  },
]

export default function ClassWiseReport() {
  const [data, setData] = useState(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState('thisMonth')

  // Calculate totals
  const totals = data.reduce(
    (acc, curr) => ({
      collected: acc.collected + curr.collected,
      pending: acc.pending + curr.pending,
      totalStudents: acc.totalStudents + curr.totalStudents,
      paidStudents: acc.paidStudents + curr.paidStudents,
      partialStudents: acc.partialStudents + curr.partialStudents,
      defaulters: acc.defaulters + curr.defaulters,
    }),
    { collected: 0, pending: 0, totalStudents: 0, paidStudents: 0, partialStudents: 0, defaulters: 0 }
  )

  const handleFilterApply = async (filters: any) => {
    setIsLoading(true)
    try {
      // In a real app, you would make an API call here with the filters
      // For demo, we'll simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate filtered data
      const filteredData = initialData.map(item => ({
        ...item,
        collected: item.collected * (0.8 + Math.random() * 0.4),
        pending: item.pending * (0.8 + Math.random() * 0.4),
      }))
      setData(filteredData)
    } catch (error) {
      console.error('Error applying filters:', error)
      // Handle error (show toast notification, etc.)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadReport = () => {
    // In a real app, this would generate and download a PDF/Excel report
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`
    const link = document.createElement('a')
    link.href = jsonString
    link.download = 'class-wise-collection-report.json'
    link.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/fees/reports"
                className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeftIcon className="w-6 h-6 text-gray-500" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Class-wise Collection</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Detailed analysis of fee collection across different classes
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadReport}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <FaceSmileIcon className="w-4 h-4 mr-2" />
              Download Report
            </button>
          </div>
        </div>

        {/* Filters */}
        <AdvancedFilters onApply={handleFilterApply} />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Collection</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              ${(totals.collected / 1000).toFixed(1)}k
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Pending: ${(totals.pending / 1000).toFixed(1)}k
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{totals.totalStudents}</p>
            <p className="mt-1 text-sm text-gray-600">
              Paid: {totals.paidStudents} | Partial: {totals.partialStudents}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Collection Rate</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {((totals.collected / (totals.collected + totals.pending)) * 100).toFixed(1)}%
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Target: 95%
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Defaulters</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{totals.defaulters}</p>
            <p className="mt-1 text-sm text-gray-600">
              Across all classes
            </p>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Collection Analysis</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedTimeframe('thisMonth')}
                className={`px-3 py-1 text-sm rounded-md ${
                  selectedTimeframe === 'thisMonth'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setSelectedTimeframe('thisYear')}
                className={`px-3 py-1 text-sm rounded-md ${
                  selectedTimeframe === 'thisYear'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                This Year
              </button>
            </div>
          </div>
          <div className="h-96">
            <GradeWiseCollection />
          </div>
        </div>

        {/* Detailed Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Detailed Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Students
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collected
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pending
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collection Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item) => (
                  <tr key={item.grade} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.grade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.totalStudents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${(item.collected / 1000).toFixed(1)}k
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${(item.pending / 1000).toFixed(1)}k
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.collectionRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      )}
    </div>
  )
}