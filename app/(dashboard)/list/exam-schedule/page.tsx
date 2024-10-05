import FormContainer from "@/components/form-container";
import Pagination from "@/components/pagination";
import Table from "@/components/table";
import TableSearch from "@/components/table-search";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { ExamSchedule, Prisma, Exam, Subject } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import ClientOnlyComponent from "@/components/client-only-component";

type ExamScheduleWithRelations = ExamSchedule & {
  exam: Exam;
  subject: Subject;
};

const ExamScheduleListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    {
      header: "Exam",
      accessor: "exam.title",
    },
    {
      header: "Subject",
      accessor: "subject.name",
    },
    {
      header: "Date",
      accessor: "date",
    },
    {
      header: "Start Time",
      accessor: "startTime",
    },
    {
      header: "End Time",
      accessor: "endTime",
    },
    {
      header: "Venue",
      accessor: "venue",
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

  const renderRow = (item: ExamScheduleWithRelations) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">{item.exam.title}</td>
      <td>{item.subject.name}</td>
      <td>{item.date.toLocaleDateString()}</td>
      <td>{item.startTime.toLocaleTimeString()}</td>
      <td>{item.endTime.toLocaleTimeString()}</td>
      <td className="hidden md:table-cell">{item.venue || "N/A"}</td>
      <td>
      <ClientOnlyComponent>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="examSchedule" type="update" data={item} />
              <FormContainer table="examSchedule" type="delete" id={item.id} />
            </>
          )}
        </div>
        </ClientOnlyComponent>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.ExamScheduleWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "examId":
            query.examId = parseInt(value);
            break;
          case "subjectId":
            query.subjectId = parseInt(value);
            break;
          case "search":
            query.OR = [
              { exam: { title: { contains: value, mode: "insensitive" } } },
              { subject: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.examSchedule.findMany({
      where: query,
      include: {
        exam: true,
        subject: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.examSchedule.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Exam Schedules</h1>
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
            {role === "admin" && <FormContainer table="examSchedule" type="create" />}
          </div>
        </div>
        </ClientOnlyComponent>
      </div>
      {/* LIST */}
      <ClientOnlyComponent>
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
      </ClientOnlyComponent>
    </div>
  );
};

export default ExamScheduleListPage;