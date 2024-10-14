'use client';

import React from 'react';
import FormContainer from "@/components/form-container";
import Pagination from "@/components/pagination";
import Table from "@/components/table";
import TableSearch from "@/components/table-search";
import Image from "next/image";
import ClientOnlyComponent from "@/components/client-only-component";
import { useSession } from "@clerk/nextjs";
import { GradeScale, School, GradeRange } from "@prisma/client";

type GradeScaleWithRelations = GradeScale & {
    school?: School | null;
    ranges: GradeRange[];
  };

interface GradeScaleListProps {
  data: GradeScaleWithRelations[];
  count: number;
  searchParams: { [key: string]: string | string[] | undefined };
}

const GradeScaleList: React.FC<GradeScaleListProps> = ({ data, count, searchParams }) => {
  const { session } = useSession();
  const role = session?.user?.publicMetadata?.role as string | undefined;

  const columns = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Ranges",
      accessor: "ranges",
      cell: (item: GradeScaleWithRelations) => (
        <div>
          {item.ranges.map((range, index) => (
            <div key={index} className="text-xs">
              {range.letterGrade}: {range.minScore}-{range.maxScore}
            </div>
          ))}
        </div>
      ),
    },
    {
      header: "Exam Types",
      accessor: "examTypes",
      cell: (item: GradeScaleWithRelations) => (
        <div>{item.examTypes.join(", ")}</div>
      ),
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

  const renderRow = (item: GradeScaleWithRelations) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">{item.name}</td>
      <td>
        {item.ranges.map((range, index) => (
          <div key={index} className="text-xs">
            {range.letterGrade}: {range.minScore}-{range.maxScore}
          </div>
        ))}
      </td>
      <td className="hidden md:table-cell">{item.examTypes.join(", ")}</td>
      <td>
        <ClientOnlyComponent>
          <div className="flex items-center gap-2">
            {role === "admin" && (
              <>
                <FormContainer table="gradeScale" type="update" data={item} />
                <FormContainer table="gradeScale" type="delete" id={item.id} />
              </>
            )}
          </div>
        </ClientOnlyComponent>
      </td>
    </tr>
  );

  const { page } = searchParams;
  const p = page ? parseInt(page as string) : 1;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Grade Scales</h1>
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
              {role === "admin" && <FormContainer table="gradeScale" type="create" />}
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

export default GradeScaleList;