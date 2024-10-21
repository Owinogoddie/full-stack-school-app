import { Suspense } from "react";
import { AppError } from "@/lib/error-handler";
import ErrorDisplay from "@/components/ErrorDisplay";
import FullScreenLoader from "@/components/full-screen-loader";
import StudentTransactionsTable from "./_components/StudentTransactionsTable";
import { getStudentTransactions } from "@/actions/fee/student-transactions";

interface PageProps {
  params: { studentId: string };
  searchParams: { academicYearId: string; termId: string };
}

export default async function StudentTransactionsPage({ params, searchParams }: PageProps) {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <StudentTransactionsContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function StudentTransactionsContent({ params, searchParams }: PageProps) {
  try {
    const transactions = await getStudentTransactions({
      studentId: params.studentId,
      academicYearId: parseInt(searchParams.academicYearId),
      termId: searchParams.termId,
    });

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Student Transactions</h1>
        <StudentTransactionsTable transactions={transactions} />
      </div>
    );
  } catch (error) {
    if (error instanceof AppError) {
      return <ErrorDisplay message={error?.message || "Something went wrong"} />;
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}