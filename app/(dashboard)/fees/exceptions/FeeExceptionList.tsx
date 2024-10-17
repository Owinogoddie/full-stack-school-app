'use client';

import React from 'react';
import FormContainer from "@/components/form-container";
import Pagination from "@/components/pagination";
import Table from "@/components/table";
import TableSearch from "@/components/table-search";
import { FeeException, FeeTemplate, Student, FeeType, AcademicYear, Term } from "@prisma/client";
import Image from "next/image";
import ClientOnlyComponent from "@/components/client-only-component";

type FeeExceptionList = FeeException & {
  feeTemplate: FeeTemplate & {
    feeType: FeeType;
    academicYear: AcademicYear;
    term: Term;
  };
  student: Student;
};

interface FeeExceptionListProps {
  data: FeeExceptionList[];
  count: number;
  searchParams: { [key: string]: string | undefined };
  role: string | undefined;
}

const FeeExceptionList: React.FC<FeeExceptionListProps> = ({ data, count, searchParams, role }) => {
  const columns = [
    {
      header: "Student Name",
      accessor: "student",
    },
    {
      header: "Fee Type",
      accessor: "feeType",
    },
    {
      header: "Exception Type",
      accessor: "type",
    },
    {
      header: "Adjustment",
      accessor: "adjustment",
    },
    {
      header: "Start Date",
      accessor: "startDate",
    },
    {
      header: "End Date",
      accessor: "endDate",
    },
    {
      header: "Status",
      accessor: "status",
    },
    ...(role === "admin" || role === "teacher"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  const renderRow = (item: FeeExceptionList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        {item.student.firstName} {item.student.lastName}
      </td>
      <td>{item.feeTemplate.feeType.name}</td>
      <td>{item.type}</td>
      <td>{item.adjustmentType === 'PERCENTAGE' ? `${item.adjustmentValue}%` : `$${item.adjustmentValue}`}</td>
      <td>{new Date(item.startDate).toLocaleDateString()}</td>
      <td>{item.endDate ? new Date(item.endDate).toLocaleDateString() : 'N/A'}</td>
      <td>{item.status}</td>
      {(role === "admin" || role === "teacher") && (
        <td>
          <FormContainer table="feeException" type="update" data={item} />
        </td>
      )}
    </tr>
  );

  const { page } = searchParams;
  const p = page ? parseInt(page) : 1;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Fee Exceptions</h1>
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
                <FormContainer table="feeException" type="create" />
              )}
            </div>
          </div>
        </ClientOnlyComponent>
      </div>
      {/* LIST */}
      <ClientOnlyComponent>
        <Table columns={columns} renderRow={renderRow} data={data} />
      </ClientOnlyComponent>
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default FeeExceptionList;