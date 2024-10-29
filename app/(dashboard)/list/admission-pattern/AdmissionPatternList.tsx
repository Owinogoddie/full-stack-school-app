// components/AdmissionPatternList.tsx
'use client';

import React from 'react';
import FormContainer from "@/components/form-container";
import Pagination from "@/components/pagination";
import Table from "@/components/table";
import TableSearch from "@/components/table-search";
import Image from "next/image";
import ClientOnlyComponent from "@/components/client-only-component";
import { useSession } from "@clerk/nextjs";
import { generateAdmissionNumber } from '@/utils/generate-admission-number';
type AdmissionPattern = {
  id: number;
  prefix: string;
  yearFormat: string;
  digitCount: number;
  separator: string | null;
  lastNumber: number;
  schoolId: string | null;  
  school: {
    name: string;
  } | null;  
  createdAt: Date;
  updatedAt: Date;
};

interface AdmissionPatternListProps {
  data: AdmissionPattern[];
  count: number;
  searchParams: { [key: string]: string | undefined };
}

const AdmissionPatternList: React.FC<AdmissionPatternListProps> = ({ 
  data, 
  count, 
  searchParams 
}) => {
  const { session } = useSession();
  const role = session?.user?.publicMetadata?.role as string | undefined;

  const columns = [
    {
      header: "School",
      accessor: "school",
    },
    {
      header: "Prefix",
      accessor: "prefix",
    },
    {
      header: "Format",
      accessor: "format",
      className: "hidden md:table-cell",
    },
    {
      header: "Last Number",
      accessor: "lastNumber",
      className: "hidden md:table-cell",
    },
    {
      header: "Example",
      accessor: "example",
      className: "hidden md:table-cell",
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

  const renderRow = (item: AdmissionPattern) => {
    const patternForGenerator = {
      prefix: item.prefix,
      yearFormat: item.yearFormat,
      digitCount: item.digitCount,
      separator: item.separator ?? undefined,
      lastNumber: item.lastNumber,
      schoolId: item.schoolId ?? undefined
    };
  
    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
      >
        <td className="p-4">{item.school?.name || 'No School'}</td>
        <td className="p-4">{item.prefix}</td>
        <td className="hidden md:table-cell p-4">
          <div className="flex flex-col">
            <span>Year: {item.yearFormat}</span>
            <span>Digits: {item.digitCount}</span>
            <span>Separator: {item.separator || "None"}</span>
          </div>
        </td>
        <td className="hidden md:table-cell p-4">{item.lastNumber}</td>
        <td className="hidden md:table-cell p-4">
          {generateAdmissionNumber(patternForGenerator)}
        </td>
        {role === "admin" && (
          <td className="p-4">
            <ClientOnlyComponent>
              <div className="flex items-center gap-2">
                <FormContainer table="admissionPattern" type="update" data={item} />
                <FormContainer table="admissionPattern" type="delete" id={item.id} />
              </div>
            </ClientOnlyComponent>
          </td>
        )}
      </tr>
    );
  };

  const { page } = searchParams;
  const p = page ? parseInt(page) : 1;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Admission Number Patterns</h1>
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
              {role === "admin" && <FormContainer table="admissionPattern" type="create" />}
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

export default AdmissionPatternList;