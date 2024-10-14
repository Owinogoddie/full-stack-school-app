// StudentList.tsx
'use client';

import React from 'react';
import FormContainer from "@/components/form-container";
import Pagination from "@/components/pagination";
import Table from "@/components/table";
import TableSearch from "@/components/table-search";
import Image from "next/image";
import Link from "next/link";
import ClientOnlyComponent from "@/components/client-only-component";
import { Class, Student, Grade, School, Parent } from "@prisma/client";

type StudentList = Student & { class: Class | null; grade: Grade; school: School | null; parent: Parent | null };

interface StudentListProps {
  data: StudentList[];
  count: number;
  searchParams: { [key: string]: string | undefined };
  role: string | undefined;
}

const StudentList: React.FC<StudentListProps> = ({ data, count, searchParams, role }) => {
  const columns = [
    {
      header: "Info",
      accessor: "info",
    },
    {
      header: "ADM NO",
      accessor: "adm",
      className: "table-cell",
    },
    {
      header: "UPI",
      accessor: "upi",
      className: "hidden md:table-cell",
    },
    {
      header: "Grade",
      accessor: "grade",
      className: "hidden md:table-cell",
    },
    {
      header: "Parent Contact",
      accessor: "parentContact",
      className: "hidden lg:table-cell",
    },
    {
      header: "Address",
      accessor: "address",
      className: "hidden lg:table-cell",
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

  const renderRow = (item: StudentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.img || "/noAvatar.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{`${item.firstName} ${item.lastName}`}</h3>
          <p className="text-xs text-gray-500">{item.class?.name || "N/A"}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.admissionNumber}</td>
      <td className="hidden md:table-cell">{item.upi}</td>
      <td className="hidden md:table-cell">{item.grade.levelName}</td>
      <td className="hidden lg:table-cell">{item.parent ? `${item.parent.phone}, ${item.parent.email}` : "N/A"}</td>
      <td className="hidden lg:table-cell">{item.address}</td>
      <td>
        <ClientOnlyComponent>
          <div className="flex items-center gap-2">
            <Link href={`/list/students/${item.id}`}>
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
                <Image src="/view.png" alt="" width={16} height={16} />
              </button>
            </Link>
            {role === "admin" && (
              <FormContainer table="student" type="delete" id={item.id} />
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
        <h1 className="hidden md:block text-lg font-semibold">All Students</h1>
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
              {role === "admin" && <FormContainer table="student" type="create" />}
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

export default StudentList;