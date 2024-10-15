// File: app/feeTemplates/FeeTemplateList.tsx

'use client';

import React from 'react';
import FormContainer from "@/components/form-container";
import Pagination from "@/components/pagination";
import Table from "@/components/table";
import TableSearch from "@/components/table-search";
import { FeeTemplate, FeeType, StudentCategory, Grade, Class, Term } from "@prisma/client";
import Image from "next/image";
import ClientOnlyComponent from "@/components/client-only-component";
import { useSession } from "@clerk/nextjs";

type FeeTemplateListType = FeeTemplate & {
  feeType: FeeType,
  studentCategories: StudentCategory[],
  grades: Grade[],
  classes: Class[],
  term: Term,
  academicYear: { id: number; year: string }, // Add this line
  // school: School | null
};

interface FeeTemplateListProps {
  data: FeeTemplateListType[];
  count: number;
  searchParams: { [key: string]: string | undefined };
}

const FeeTemplateList: React.FC<FeeTemplateListProps> = ({ data, count, searchParams }) => {
  const { session } = useSession();
  const role = session?.user?.publicMetadata?.role as string | undefined;

  const columns = [
    {
      header: "Academic Year",
      accessor: "academicYear.year",
    },
    {
      header: "Grades",
      accessor: "grades",
    },
    {
      header: "Classes",
      accessor: "classes",
    },
    {
      header: "Term",
      accessor: "term",
    },
    {
      header: "Fee Type",
      accessor: "feeType",
    },
    {
      header: "Student Categories",
      accessor: "studentCategories",
      className: "hidden md:table-cell",
    },
    {
      header: "Base Amount",
      accessor: "baseAmount",
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

  const renderRow = (item: FeeTemplateListType) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">{item.academicYear.year}</td>
      <td className="p-4">{item.grades.map(g => g.levelName).join(', ')}</td>
      <td className="p-4">{item.classes.map(c => c.name).join(', ')}</td>
      <td className="p-4">{item.term.name}</td>
      <td className="p-4">{item.feeType.name}</td>
      <td className="hidden md:table-cell p-4">{item.studentCategories.map(sc => sc.name).join(', ') || 'N/A'}</td>
      <td className="p-4">{item.baseAmount.toFixed(2)}</td>
      {role === "admin" && (
        <td className="p-4">
          <ClientOnlyComponent>
            <div className="flex items-center gap-2">
              <FormContainer table="feeTemplate" type="update" data={item} />
              <FormContainer table="feeTemplate" type="delete" id={item.id} />
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
        <h1 className="hidden md:block text-lg font-semibold">All Fee Templates</h1>
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
              {role === "admin" && <FormContainer table="feeTemplate" type="create" />}
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

export default FeeTemplateList;