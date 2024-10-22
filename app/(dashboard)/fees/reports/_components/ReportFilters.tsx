'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { FunnelIcon } from '@heroicons/react/24/outline'

type FilterState = {
  academicYear: string
  term: string
  grade: string
  class: string
  feeType: string
  dateRange: [Date | null, Date | null]
}

export function ReportFilters() {
  const [filters, setFilters] = useState<FilterState>({
    academicYear: '',
    term: '',
    grade: '',
    class: '',
    feeType: '',
    dateRange: [null, null],
  })

  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          {/* Quick Filter Buttons */}
          <button
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            onClick={() => {/* Set this term */}}
          >
            This Term
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            onClick={() => {/* Set this year */}}
          >
            This Year
          </button>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
        >
          <FunnelIcon className="w-4 h-4 mr-2" />
          Advanced Filters
        </button>
      </div>

      {/* Advanced Filters Modal */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        {/* Custom overlay */}
        <div className="fixed inset-0 bg-black opacity-30" />

        <div className="flex items-center justify-center min-h-screen">
          <div className="relative bg-white rounded-lg max-w-md w-full mx-auto p-6">
            <Dialog.Title className="text-lg font-medium mb-4">
              Advanced Filters
            </Dialog.Title>

            <div className="space-y-4">
              {/* Filter Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Academic Year
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={filters.academicYear}
                  onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
                >
                  {/* Add options */}
                </select>
              </div>

              {/* Add more filter fields */}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Apply filters
                    setIsOpen(false)
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
