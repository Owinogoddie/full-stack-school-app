import { getStudentTransactions } from '@/actions/fee/transactions';
import FullScreenLoader from '@/components/full-screen-loader';
import { Suspense } from 'react'
import StudentTransactionsTable from './_components/StudentTransactionsTable';

export default async function StudentTransactionsPage({
  params,
  searchParams,
}: {
  params: { studentId: string }
  searchParams: { academicYearId: string; termId: string }
}) {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <StudentTransactionsContent params={params} searchParams={searchParams} />
    </Suspense>
  )
}

async function StudentTransactionsContent({
  params,
  // searchParams,
}: {
  params: { studentId: string }
  searchParams: { academicYearId: string; termId: string }
}) {
  const transactions = await getStudentTransactions(params.studentId)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Student Transactions</h1>
      <StudentTransactionsTable initialTransactions={transactions} />
    </div>
  )
}