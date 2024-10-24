// app/fee-exceptions/FeeExceptionList.tsx
'use client';

import React from 'react';
import FormContainer from "@/components/form-container";
import Pagination from "@/components/pagination";
import Table from "@/components/table";
import TableSearch from "@/components/table-search";
import Image from "next/image";
import ClientOnlyComponent from "@/components/client-only-component";
import { FeeExceptionListItem } from './page';

interface FeeExceptionListProps {
  data: FeeExceptionListItem[];
  count: number;
  searchParams: { [key: string]: string | undefined };
  role: string | undefined;
}

const FeeExceptionList: React.FC<FeeExceptionListProps> = ({ 
  data, 
  count, 
  searchParams, 
  role 
}) => {
  const formatNumber = (value: number | null, isPercentage: boolean = false) => {
    if (value === null) return 'N/A';
    // Round to 2 decimal places
    const formattedValue = Number(value).toFixed(2);
    if (isPercentage) {
      return `${formattedValue}%`;
    }
    return `$${formattedValue}`;
  };

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
      accessor: "exceptionType",
    },
    {
      header: "Amount",
      accessor: "amount",
    },
    {
      header: "Percentage",
      accessor: "percentage",
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
    ...(role === "admin"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  const renderRow = (item: FeeExceptionListItem) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        {item.student.firstName} {item.student.lastName}
      </td>
      <td>{item.feeType.name}</td>
      <td>{item.exceptionType}</td>
<td>{formatNumber(item.amount)}</td>
<td>{formatNumber(item.percentage, true)}</td>
      <td>{new Date(item.startDate).toLocaleDateString()}</td>
      <td>{item.endDate ? new Date(item.endDate).toLocaleDateString() : 'N/A'}</td>
      <td>{item.status}</td>
      {role === "admin" && (
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
              {role === "admin" && (
                <FormContainer table="feeException" type="create" />
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

export default FeeExceptionList;