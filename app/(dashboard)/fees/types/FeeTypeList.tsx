// app/fee-types/FeeTypeList.tsx
'use client';

import React from 'react';
import FormContainer from "@/components/form-container";
import Pagination from "@/components/pagination";
import Table from "@/components/table";
import TableSearch from "@/components/table-search";
import { FeeType, School, FeeTemplate, FeeException } from "@prisma/client";
import Image from "next/image";
import ClientOnlyComponent from "@/components/client-only-component";
import { useSession } from "@clerk/nextjs";
// import { formatCurrency } from "@/lib/utils";

type ExtendedFeeTemplate = FeeTemplate & {
  exceptions: FeeException[];
};

type FeeTypeWithRelations = FeeType & {
  school: School | null;
  feeTemplates: ExtendedFeeTemplate[];
};

interface FeeTypeListProps {
  data: FeeTypeWithRelations[];
  count: number;
  searchParams: { [key: string]: string | undefined };
}

const FeeTypeList: React.FC<FeeTypeListProps> = ({ data, count, searchParams }) => {
  const { session } = useSession();
  const role = session?.user?.publicMetadata?.role as string | undefined;
  const schoolId = session?.user?.publicMetadata?.schoolId as string | undefined;

  const columns = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Description",
      accessor: "description",
      className: "hidden md:table-cell",
    },
    {
      header: "Amount",
      accessor: "amount",
    },
    {
      header: "School",
      accessor: "school",
      className: "hidden md:table-cell",
    },
    {
      header: "Active Templates",
      accessor: "activeTemplates",
      className: "hidden md:table-cell",
    },
    ...(role === "admin" || role === "school_admin"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  const getActiveTemplatesCount = (templates: ExtendedFeeTemplate[]) => {
    return templates.filter(template => template.isActive).length;
  };

  const renderRow = (item: FeeTypeWithRelations) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">{item.name}</td>
      <td className="hidden md:table-cell p-4">{item.description}</td>
      <td className="p-4">{item.amount ? item.amount : '-'}</td>
      <td className="hidden md:table-cell p-4">{item.school?.name || '-'}</td>
      <td className="hidden md:table-cell p-4">{getActiveTemplatesCount(item.feeTemplates)}</td>
      {(role === "admin" || (role === "school_admin" && item.schoolId === schoolId)) && (
        <td className="p-4">
          <ClientOnlyComponent>
            <div className="flex items-center gap-2">
              <FormContainer table="feeType" type="update" data={item} />
              <FormContainer 
                table="feeType" 
                type="delete" 
                id={item.id} 
                // disabled={item.feeTemplates.length > 0}
                // tooltip={item.feeTemplates.length > 0 ? "Cannot delete fee type with active templates" : undefined}
              />
            </div>
          </ClientOnlyComponent>
        </td>
      )}
    </tr>
  );

  const { page } = searchParams;
  const p = page ? parseInt(page) : 1;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Fee Types</h1>
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
              {(role === "admin" || role === "school_admin") && (
                <FormContainer table="feeType" type="create" />
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

export default FeeTypeList;