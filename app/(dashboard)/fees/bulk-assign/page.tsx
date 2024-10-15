// // app/fees/bulk-assign/page.tsx
// 'use client'
// import { useState, useEffect } from 'react'
// import { z } from 'zod'
// import Select from 'react-select'

// const bulkAssignmentSchema = z.object({
//   feeTypeId: z.string().min(1, "Fee type is required"),
//   amount: z.number().min(0, "Amount must be non-negative"),
//   dueDate: z.string().min(1, "Due date is required"),
//   assignmentType: z.enum(['grade', 'class', 'students']),
//   gradeId: z.string().optional(),
//   classId: z.string().optional(),
//   studentIds: z.array(z.string()).optional(),
// })

// type BulkAssignmentFormData = z.infer<typeof bulkAssignmentSchema>

// export default function BulkFeeAssignmentPage() {
//   const [formData, setFormData] = useState<BulkAssignmentFormData>({
//     feeTypeId: '',
//     amount: 0,
//     dueDate: '',
//     assignmentType: 'grade',
//     gradeId: '',
//     classId: '',
//     studentIds: [],
//   })
//   const [errors, setErrors] = useState<Partial<BulkAssignmentFormData>>({})
//   const [grades, setGrades] = useState<any[]>([])
//   const [classes, setClasses] = useState<any[]>([])
//   const [students, setStudents] = useState<any[]>([])

//   useEffect(() => {
//     // Fetch grades, classes, and students from API
//   }, [])

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     try {
//       const validatedData = bulkAssignmentSchema.parse(formData)
//       // Submit bulk assignment to API
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         setErrors(error.flatten().fieldErrors as Partial<BulkAssignmentFormData>)
//       }
//     }
//   }

//   return (
//     <form onSubmit={handleSubmit} className="max-w-md mx-auto">
//       <h1 className="text-2xl font-bold mb-4">Bulk Fee Assignment</h1>
//       {/* Fee type, amount, and due date fields remain the same */}
//       <div className="mb-4">
//         <label className="block mb-1">Assignment Type</label>
//         <Select
//           options={[
//             { value: 'grade', label: 'By Grade' },
//             { value: 'class', label: 'By Class' },
//             { value: 'students', label: 'By Students' },
//           ]}
//           value={{ value: formData.assignmentType, label: formData.assignmentType.charAt(0).toUpperCase() + formData.assignmentType.slice(1) }}
//           onChange={(option) => setFormData({ ...formData, assignmentType: option?.value as 'grade' | 'class' | 'students' })}
//         />
//       </div>
//       {formData.assignmentType === 'grade' && (
//         <div className="mb-4">
//           <label htmlFor="gradeId" className="block mb-1">Grade</label>
//           <Select
//             options={grades.map(grade => ({ value: grade.id, label: grade.name }))}
//             onChange={(option) => setFormData({ ...formData, gradeId: option?.value || '' })}
//           />
//           {errors.gradeId && <p className="text-red-500">{errors.gradeId}</p>}
//         </div>
//       )}
//       {formData.assignmentType === 'class' && (
//         <div className="mb-4">
//           <label htmlFor="classId" className="block mb-1">Class</label>
//           <Select
//             options={classes.map(cls => ({ value: cls.id, label: cls.name }))}
//             onChange={(option) => setFormData({ ...formData, classId: option?.value || '' })}
//           />
//           {errors.classId && <p className="text-red-500">{errors.classId}</p>}
//         </div>
//       )}
//       {formData.assignmentType === 'students' && (
//         <div className="mb-4">
//           <label htmlFor="studentIds" className="block mb-1">Students</label>
//           <Select
//             isMulti
//             options={students.map(student => ({ value: student.id, label: student.name }))}
//             onChange={(options) => setFormData({ ...formData, studentIds: options.map(option => option.value) })}
//           />
//           {errors.studentIds && <p className="text-red-500">{errors.studentIds}</p>}
//         </div>
//       )}
//       <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
//         Assign Fees
//       </button>
//     </form>
//   )
// }