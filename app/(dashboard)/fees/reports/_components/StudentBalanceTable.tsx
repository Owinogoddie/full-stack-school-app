// // app/fees/reports/components/StudentBalanceTable.tsx
// 'use client'

// import { useState } from 'react'

// const dummyStudents = [
//   {
//     id: 1,
//     name: 'John Doe',
//     grade: '10',
//     class: 'A',
//     totalFees: 5000,
//     paid: 4500,
//     balance: 500,
//     lastPayment: '2024-02-15',
//     status: 'Partial',
//   },
//   // ... add more students
// ]

// export function StudentBalanceTable() {
//   const [sortColumn, setSortColumn] = useState('balance')
//   const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

//   const sortedStudents = [...dummyStudents].sort((a, b) => {
//     if (sortDirection === 'asc') {
//       return a[sortColumn] > b[sortColumn] ? 1 : -1
//     }
//     return a[sortColumn] < b[sortColumn] ? 1 : -1
//   })

//   return (
//     <div className="bg-white shadow rounded-lg">
//       <div className="px-4 py-5 sm:px-6">
//         <h3 className="text-lg font-medium text-gray-900">Student Balance Details</h3>
//       </div>
//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               {[
//                 'Name',
//                 'Grade',
//                 'Class',
//                 'Total Fees',
//                 'Paid',
//                 'Balance',
//                 'Last Payment',
//                 'Status',
//               ].map((header) => (
//                 <th
//                   key={header}
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                 >
//                   {header}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {sortedStudents.map((student) => (
//               <tr key={student.id}>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="text-sm font-medium text-gray-900">
//                     {student.name}
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                   {student.grade}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                   {student.class}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                   ${student.totalFees.toLocaleString()}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                   ${student.paid.toLocaleString()}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span className={`px-2 py-1 text-xs font-medium rounded-full ${
//                     student.balance > 0 
//                       ? 'bg-red-100 text-red-800' 
//                       : 'bg-green-100 text-green-800'
//                   }`}>
//                     ${student.balance.toLocaleString()}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                   {new Date(student.lastPayment).toLocaleDateString()}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span className={`px-2 py-1 text-xs font-medium rounded-full ${
//                     student.status === 'Paid' 
//                       ? 'bg-green-100 text-green-800'
//                       : 'bg-yellow-100 text-yellow-800'
//                   }`}>
//                     {student.status}
//                   </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   )
// }