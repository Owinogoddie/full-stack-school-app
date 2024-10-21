// app/(dashboard)/special-programmes/SpecialProgrammeList.tsx
'use client';

import React from 'react';
import FormContainer from "@/components/form-container";
import Pagination from "@/components/pagination";
import Table from "@/components/table";
import TableSearch from "@/components/table-search";
import { Grade, Class, Student, SpecialProgramme } from "@prisma/client";
import Image from "next/image";
import ClientOnlyComponent from "@/components/client-only-component";
import { useSession } from "@clerk/nextjs";

type SpecialProgrammeListType = SpecialProgramme & {
  grades: Grade[];
  classes: Class[];
  students: Pick<Student, 'id' | 'firstName' | 'lastName'>[];
};

interface SpecialProgrammeListProps {
  data: SpecialProgrammeListType[];
  count: number;
  searchParams: { [key: string]: string | undefined };
}

const SpecialProgrammeList: React.FC<SpecialProgrammeListProps> = ({
  data,
  count,
  searchParams,
}) => {
  const { session } = useSession();
  const role = session?.user?.publicMetadata?.role as string | undefined;

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
      header: "Grades",
      accessor: "grades",
      className: "hidden md:table-cell",
    },
    {
      header: "Classes",
      accessor: "classes",
      className: "hidden md:table-cell",
    },
    {
      header: "Students",
      accessor: "students",
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

  const renderRow = (item: SpecialProgrammeListType) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">{item.name}</td>
      <td className="hidden md:table-cell p-4">{item.description}</td>
      <td className="hidden md:table-cell p-4">
        {item.grades.map((grade) => grade.levelName).join(", ")}
      </td>
      <td className="hidden md:table-cell p-4">
        {item.classes.map((cls) => cls.name).join(", ")}
      </td>
      <td className="hidden md:table-cell p-4">
        {item.students.map((student) => `${student.firstName} ${student.lastName}`).join(", ")}
      </td>
      {role === "admin" && (
        <td className="p-4">
          <ClientOnlyComponent>
            <div className="flex items-center gap-2">
              <FormContainer
                table="specialProgramme"
                type="update"
                data={item}
              />
              <FormContainer
                table="specialProgramme"
                type="delete"
                id={item.id}
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
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          All Special Programmes
        </h1>
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
                <FormContainer table="specialProgramme" type="create" />
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

export default SpecialProgrammeList;