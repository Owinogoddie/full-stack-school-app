// // app/fees/reports/components/AdvancedFilters.tsx
// 'use client'

// import { useState } from 'react'
// import { Dialog } from '@headlessui/react'
// import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'
// import DatePicker from 'react-datepicker'
// import "react-datepicker/dist/react-datepicker.css"

// type FilterState = {
//   academicYear: string
//   term: string
//   grade: string
//   class: string
//   feeType: string
//   paymentMethod: string
//   studentCategory: string
//   dateRange: [Date | null, Date | null]
//   paymentStatus: string
//   minimumAmount: string
//   maximumAmount: string
// }

// const initialFilters: FilterState = {
//   academicYear: '',
//   term: '',
//   grade: '',
//   class: '',
//   feeType: '',
//   paymentMethod: '',
//   studentCategory: '',
//   dateRange: [null, null],
//   paymentStatus: '',
//   minimumAmount: '',
//   maximumAmount: '',
// }

// export function AdvancedFilters({ onApply }: { onApply: (filters: FilterState) => void }) {
//   const [isOpen, setIsOpen] = useState(false)
//   const [filters, setFilters] = useState<FilterState>(initialFilters)

//   const academicYears = ['2023-2024', '2024-2025']
//   const terms = ['Term 1', 'Term 2', 'Term 3']
//   const grades = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
//   const classes = ['A', 'B', 'C']
//   const feeTypes = ['Tuition', 'Development', 'Transport', 'Laboratory']
//   const paymentMethods = ['Cash', 'Bank Transfer', 'Mobile Money', 'Check']
// //   const studentCategories = ['Regular', 'Scholarship', 'Staff Child']
// //   const paymentStatuses = ['Paid', 'Partial', 'Pending', 'Overdue']

//   return (
//     <div className="mb-6">
//       <div className="flex justify-between items-center">
//         <div className="flex space-x-4">
//           <button
//             onClick={() => {
//               const today = new Date()
//               // Set filters for current term
//               setFilters({
//                 ...filters,
//                 dateRange: [
//                   new Date(today.getFullYear(), today.getMonth() - 4, 1),
//                   today
//                 ]
//               })
//             }}
//             className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
//           >
//             This Term
//           </button>
//           <button
//             onClick={() => {
//               const today = new Date()
//               setFilters({
//                 ...filters,
//                 dateRange: [
//                   new Date(today.getFullYear(), 0, 1),
//                   today
//                 ]
//               })
//             }}
//             className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
//           >
//             This Year
//           </button>
//         </div>

//         <button
//           onClick={() => setIsOpen(true)}
//           className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
//         >
//           <FunnelIcon className="w-4 h-4 mr-2" />
//           Advanced Filters
//         </button>
//       </div>

//       <Dialog
//         open={isOpen}
//         onClose={() => setIsOpen(false)}
//         className="fixed inset-0 z-50 overflow-y-auto"
//       >
//         <div className="flex items-center justify-center min-h-screen px-4">
//           <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

//           <div className="relative bg-white rounded-xl max-w-3xl w-full mx-auto p-6">
//             <div className="flex justify-between items-center mb-6">
//               <Dialog.Title className="text-xl font-semibold text-gray-900">
//                 Advanced Filters
//               </Dialog.Title>
//               <button
//                 onClick={() => setIsOpen(false)}
//                 className="text-gray-400 hover:text-gray-500"
//               >
//                 <XMarkIcon className="w-6 h-6" />
//               </button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Academic Year */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Academic Year
//                 </label>
//                 <select
//                   className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                   value={filters.academicYear}
//                   onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
//                 >
//                   <option value="">Select Academic Year</option>
//                   {academicYears.map((year) => (
//                     <option key={year} value={year}>{year}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Term */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Term
//                 </label>
//                 <select
//                   className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                   value={filters.term}
//                   onChange={(e) => setFilters({ ...filters, term: e.target.value })}
//                 >
//                   <option value="">Select Term</option>
//                   {terms.map((term) => (
//                     <option key={term} value={term}>{term}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Grade */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Grade
//                 </label>
//                 <select
//                   className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                   value={filters.grade}
//                   onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
//                 >
//                   <option value="">Select Grade</option>
//                   {grades.map((grade) => (
//                     <option key={grade} value={grade}>{grade}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Class */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Class
//                 </label>
//                 <select
//                   className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                   value={filters.class}
//                   onChange={(e) => setFilters({ ...filters, class: e.target.value })}
//                 >
//                   <option value="">Select Class</option>
//                   {classes.map((cls) => (
//                     <option key={cls} value={cls}>{cls}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Fee Type */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Fee Type
//                 </label>
//                 <select
//                   className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                   value={filters.feeType}
//                   onChange={(e) => setFilters({ ...filters, feeType: e.target.value })}
//                 >
//                   <option value="">Select Fee Type</option>
//                   {feeTypes.map((type) => (
//                     <option key={type} value={type}>{type}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Payment Method */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Payment Method
//                 </label>
//                 <select
//                   className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                   value={filters.paymentMethod}
//                   onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
//                 >
//                   <option value="">Select Payment Method</option>
//                   {paymentMethods.map((method) => (
//                     <option key={method} value={method}>{method}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Date Range */}
//               <div className="col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Date Range
//                 </label>
//                 <div className="flex space-x-4">
//                   <DatePicker
//                     selected={filters.dateRange[0]}
//                     onChange={(date) => setFilters({
//                       ...filters,
//                       dateRange: [date, filters.dateRange[1]]
//                     })}
//                     className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                     placeholderText="Start Date"
//                   />
//                   <DatePicker
//                     selected={filters.dateRange[1]}
//                     onChange={(date) => setFilters({
//                       ...filters,
//                       dateRange: [filters.dateRange[0], date]
//                     })}
//                     className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                     placeholderText="End Date"
//                   />
//                 </div>
//               </div>

//               {/* Amount Range */}
//               <div className="col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Amount Range
//                 </label>
//                 <div className="flex space-x-4">
//                   <input
//                     type="number"
//                     placeholder="Minimum Amount"
//                     className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                     value={filters.minimumAmount}
//                     onChange={(e) => setFilters({ ...filters, minimumAmount: e.target.value })}
//                   />
//                   <input
//                     type="number"
//                     placeholder="Maximum Amount"
//                     className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                     value={filters.maximumAmount}
//                     onChange={(e) => setFilters({ ...filters, maximumAmount: e.target.value })}
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="mt-8 flex justify-end space-x-4">
//               <button
//                 onClick={() => {
//                   setFilters(initialFilters)
//                 }}
//                 className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
//               >
//                 Reset
//               </button>
//               <button
//                 onClick={() => {
//                   onApply(filters)
//                   setIsOpen(false)
//                 }}
//                 className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
//               >
//                 Apply Filters
//               </button>
//             </div>
//           </div>
//         </div>
//       </Dialog>
//     </div>
//   )
// }