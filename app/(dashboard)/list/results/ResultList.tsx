// ResultList.tsx
'use client';

import React from 'react';
import FormContainer from "@/components/form-container";
import Pagination from "@/components/pagination";
import Table from "@/components/table";
import TableSearch from "@/components/table-search";
import Image from "next/image";
import ClientOnlyComponent from "@/components/client-only-component";
import Link from "next/link";

interface ResultListProps {
  data: any[];
  count: number;
  searchParams: { [key: string]: string | undefined };
  role: string | undefined;
}

const ResultList: React.FC<ResultListProps> = ({ data, count, searchParams, role }) => {
  const columns = [
    { header: "Student", accessor: "studentName" },
    { header: "Exam", accessor: "examName" },
    { header: "Subject", accessor: "subjectName" },
    { header: "Academic Year", accessor: "academicYearName" },
    { header: "Grade", accessor: "gradeName" },
    { header: "Class", accessor: "className" },
    { header: "Score", accessor: "score" },
    { header: "Result Grade", accessor: "resultGrade" },
    { header: "Remarks", accessor: "remarks" },
    ...(role === "admin" || role === "teacher"
      ? [{ header: "Actions", accessor: "action" }]
      : []),
  ];

  const renderRow = (item: any) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">{item.studentName}</td>
      <td>{item.examName}</td>
      <td>{item.subjectName}</td>
      <td>{item.academicYearName}</td>
      <td>{item.gradeName}</td>
      <td>{item.className || "N/A"}</td>
      <td>{item.score}</td>
      <td>{item.resultGrade || "N/A"}</td>
      <td>{item.remarks || "N/A"}</td>
      <td>
        <ClientOnlyComponent>
          <div className="flex items-center gap-2">
            {(role === "admin" || role === "teacher") && (
              <>
                <FormContainer table="result" type="update" data={item} />
                <FormContainer table="result" type="delete" id={item.id} />
              </>
            )}
          </div>
        </ClientOnlyComponent>
      </td>
    </tr>
  );

  const { page } = searchParams;
  const p = page ? parseInt(page) : 1;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Results</h1>
        <ClientOnlyComponent>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/filter.png" alt="" width={14} height={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/sort.png" alt="" width={14} height={14} />
              </button>
              {(role === "admin" || role === "teacher") && (
                <>
                  <FormContainer table="result" type="create" />
                  <Link
                    href="/list/results/results/bulk-add"
                    className="px-4 py-2 bg-lamaBlue text-blue-500 rounded-md hover:bg-lamaBlue-dark"
                  >
                    Bulk Add
                  </Link>
                </>
              )}
            </div>
          </div>
        </ClientOnlyComponent>
      </div>
      <ClientOnlyComponent>
        <Table columns={columns} renderRow={renderRow} data={data} />
      </ClientOnlyComponent>
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ResultList;