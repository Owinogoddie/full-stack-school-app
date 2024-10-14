'use client';

import React from 'react';
import FormContainer from "@/components/form-container";
import Pagination from "@/components/pagination";
import Table from "@/components/table";
import TableSearch from "@/components/table-search";
import { AcademicYear, Exam, Grade, Subject } from "@prisma/client";
import Image from "next/image";
import ClientOnlyComponent from "@/components/client-only-component";

type ExamList = Exam & {
  subject: Subject;
  grade: Grade;
  academicYear: AcademicYear;
  lesson?: {
    class: { name: string };
    teacher: { firstName: string; lastName: string };
  } | null;
};

interface ExamListProps {
  data: ExamList[];
  count: number;
  searchParams: { [key: string]: string | undefined };
  role: string | undefined;
}

const ExamList: React.FC<ExamListProps> = ({ data, count, searchParams, role }) => {
  const columns = [
    {
      header: "Subject Name",
      accessor: "subject",
    },
    {
      header: "Grade",
      accessor: "grade",
    },
    {
      header: "Academic Year",
      accessor: "academicYear",
    },
    {
      header: "Exam Type",
      accessor: "examType",
    },
    {
      header: "Start Date",
      accessor: "startDate",
    },
    {
      header: "End Date",
      accessor: "endDate",
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

  const renderRow = (item: ExamList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.subject.name}</td>
      <td>{item.grade.levelName}</td>
      <td>{item.academicYear.year}</td>
      <td>{item.examType}</td>
      <td>{new Intl.DateTimeFormat("en-US").format(item.startDate)}</td>
      <td>{new Intl.DateTimeFormat("en-US").format(item.endDate)}</td>
      <td>
        {item.lesson ? (
          <div>
            Teacher: {item.lesson.teacher.firstName} {item.lesson.teacher.lastName}
            <br />
            Class: {item.lesson.class.name}
          </div>
        ) : (
          "No lesson assigned"
        )}
      </td>
    </tr>
  );
  
  const { page } = searchParams;
  const p = page ? parseInt(page) : 1;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Exams</h1>
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
              <FormContainer table="exam" type="create" />
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

export default ExamList;