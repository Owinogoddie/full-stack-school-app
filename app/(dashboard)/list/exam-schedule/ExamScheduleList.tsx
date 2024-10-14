"use client";

import React from "react";
import { useSession } from "@clerk/nextjs";
import ClientOnlyComponent from "@/components/client-only-component";
import FormContainer from "@/components/form-container";
import Pagination from "@/components/pagination";
import Table from "@/components/table";
import TableSearch from "@/components/table-search";
import Image from "next/image";
import { ExamSchedule, Exam, Subject } from "@prisma/client";

type ExamScheduleWithRelations = ExamSchedule & {
  exam: Exam;
  subject: Subject;
};

interface ExamScheduleListProps {
  data: ExamScheduleWithRelations[];
  count: number;
  searchParams: { [key: string]: string | undefined };
}

const ExamScheduleList: React.FC<ExamScheduleListProps> = ({
  data,
  count,
  searchParams,
}) => {
  const { session } = useSession();
  const role = session?.user?.publicMetadata?.role as string | undefined;

  const columns = [
    { header: "Exam", accessor: "exam.title" },
    { header: "Subject", accessor: "subject.name" },
    { header: "Date", accessor: "date" },
    { header: "Start Time", accessor: "startTime" },
    { header: "End Time", accessor: "endTime" },
    { header: "Venue", accessor: "venue", className: "hidden md:table-cell" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: ExamScheduleWithRelations) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">{item.exam.title}</td>
      <td>{item.subject.name}</td>
      <td>{new Date(item.date).toLocaleDateString()}</td>
      <td>{item.startTime.toLocaleTimeString()}</td>
      <td>{item.endTime.toLocaleTimeString()}</td>

      <td className="hidden md:table-cell">{item.venue || "N/A"}</td>
      {role === "admin" && (
        <td>
          <ClientOnlyComponent>
            <div className="flex items-center gap-2">
              <FormContainer table="examSchedule" type="update" data={item} />
              <FormContainer table="examSchedule" type="delete" id={item.id} />
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
        <h1 className="hidden md:block text-lg font-semibold">
          Exam Schedules
        </h1>
        <ClientOnlyComponent>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/filter.png" alt="Filter" width={14} height={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/sort.png" alt="Sort" width={14} height={14} />
              </button>
              {role === "admin" && (
                <FormContainer table="examSchedule" type="create" />
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

export default ExamScheduleList;
