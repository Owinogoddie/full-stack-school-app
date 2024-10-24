// app/(dashboard)/fees/FeeList.tsx
'use client';

import React from 'react';
import FormContainer from "@/components/form-container";
import Pagination from "@/components/pagination";
import Table from "@/components/table";
import TableSearch from "@/components/table-search";
import { Fee, FeeType, Term, AcademicYear, Grade, Class, StudentCategory, SpecialProgramme } from "@prisma/client";
import Image from "next/image";
import ClientOnlyComponent from "@/components/client-only-component";
import { useSession } from "@clerk/nextjs";

type FeeListType = Fee & {
    template?: {
      id: string;
      feeType: FeeType;
    } | null;
    term?: Term | null;
    academicYear?: AcademicYear | null;
    grades: Grade[];
    classes: Class[];
    studentCategories: StudentCategory[];
    specialPrograms: SpecialProgramme[];
  };

interface FeeListProps {
  data: FeeListType[];
  count: number;
  searchParams: { [key: string]: string | undefined };
}

const FeeList: React.FC<FeeListProps> = ({ data, count, searchParams }) => {
  const { session } = useSession();
  const role = session?.user?.publicMetadata?.role as string | undefined;

  const columns = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Amount",
      accessor: "amount",
    },
    {
      header: "Fee Type",
      accessor: "feeType",
    },
    {
      header: "Term",
      accessor: "term",
      className: "hidden md:table-cell",
    },
    {
      header: "Academic Year",
      accessor: "academicYear",
      className: "hidden md:table-cell",
    },
    {
      header: "Applicable To",
      accessor: "applicableTo",
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

  const renderRow = (item: FeeListType) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">
        <div>
          <div>{item.name}</div>
          {item.description && (
            <div className="text-xs text-gray-500">{item.description}</div>
          )}
        </div>
      </td>
      <td className="p-4">{item.amount.toString()}</td>
      <td className="p-4">{item.template?.feeType.name || 'N/A'}</td>
      <td className="hidden md:table-cell p-4">{item.term?.name || 'N/A'}</td>
      <td className="hidden md:table-cell p-4">{item.academicYear?.year || 'N/A'}</td>
      <td className="hidden md:table-cell p-4">
        <div className="text-xs">
          {item.grades.length > 0 && (
            <div>Grades: {item.grades.map(g => g.levelName).join(', ')}</div>
          )}
          {item.classes.length > 0 && (
            <div>Classes: {item.classes.map(c => c.name).join(', ')}</div>
          )}
          {item.studentCategories.length > 0 && (
            <div>Categories: {item.studentCategories.map(sc => sc.name).join(', ')}</div>
          )}
          {item.specialPrograms.length > 0 && (
            <div>Programs: {item.specialPrograms.map(sp => sp.name).join(', ')}</div>
          )}
        </div>
      </td>
      {role === "admin" && (
        <td className="p-4">
          <ClientOnlyComponent>
            <div className="flex items-center gap-2">
              <FormContainer table="fee" type="update" data={item} />
              <FormContainer table="fee" type="delete" id={item.id} />
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
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Fees</h1>
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
              {role === "admin" && <FormContainer table="fee" type="create" />}
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

export default FeeList;