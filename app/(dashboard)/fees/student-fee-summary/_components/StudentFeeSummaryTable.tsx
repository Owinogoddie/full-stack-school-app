'use client';

import { useState, useEffect } from 'react';
import FullScreenLoader from '@/components/full-screen-loader';
import SearchField from '@/components/search-field';
import Link from 'next/link';
import { StudentFeeSummary, getStudentFeeSummary } from '@/actions/fee/fee-summary';

interface StudentFeeSummaryTableProps {
    params: {
      academicYearId: number;
      termId: string;
      gradeId?: number;
      classId?: number;
      feeTypeIds: string[];
    };
  }

export default function StudentFeeSummaryTable({ params }: StudentFeeSummaryTableProps) {
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<StudentFeeSummary[]>([]);
  const [filteredSummaries, setFilteredSummaries] = useState<StudentFeeSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSummaries = async () => {
      setLoading(true);
      try {
        const data = await getStudentFeeSummary(params);
        setSummaries(data);
        setFilteredSummaries(data);
      } catch (error) {
        console.error('Failed to fetch student fee summaries:', error);
        // Handle error (e.g., show error message)
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, [params]);

  useEffect(() => {
    const filtered = summaries.filter(
      (summary) =>
        summary.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${summary.firstName} ${summary.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSummaries(filtered);
  }, [searchTerm, summaries]);

  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <SearchField
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          placeholder="Search by admission number or name..."
          className="w-full max-w-md"
        />
        <span className="text-sm text-gray-600">
          Showing {filteredSummaries.length} of {summaries.length} students
        </span>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Expected
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Exemptions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Paid
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSummaries.map((summary) => (
              <tr key={summary.studentId}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{summary.firstName} {summary.lastName}</div>
                  <div className="text-sm text-gray-500">{summary.admissionNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {summary.totalExpected.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {summary.totalExemptions.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {summary.totalPaid.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {summary.balance.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link 
                    href={`/fees/student-transactions/${summary.studentId}?academicYearId=${params.academicYearId}&termId=${params.termId}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View Transactions
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}