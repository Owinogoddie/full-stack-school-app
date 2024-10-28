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
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const columns = [
    {
      header: "Student Name",
      accessor: "student",
    },
    {
      header: "Fee Structure",
      accessor: "feeStructure",
    },
    {
      header: "Amount",
      accessor: "amount",
    },
    {
      header: "Reason",
      accessor: "reason",
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
      accessor: "isActive",
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
<td>{item.feeStructure.feeType.name}-{item.feeStructure.term ? item.feeStructure.term.name : 'N/A'}-{item.feeStructure.academicYear.year}</td>
      <td>{formatCurrency(item.amount)}</td>
      <td>{item.reason}</td>
      <td>{new Date(item.startDate).toLocaleDateString()}</td>
      <td>{item.endDate ? new Date(item.endDate).toLocaleDateString() : 'N/A'}</td>
      <td>
        <span className={`px-2 py-1 rounded-full text-xs ${
          item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {item.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      {role === "admin" && (
        <td className="p-4">
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
              <button className="w-8 h-8 flex items-center justify-c  enter rounded-full bg-lamaYellow">
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