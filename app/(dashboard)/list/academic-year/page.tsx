import FormContainer from "@/components/form-container";
import Pagination from "@/components/pagination";
import Table from "@/components/table";
import TableSearch from "@/components/table-search";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { AcademicYear, Prisma, Enrollment } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

type AcademicYearList = AcademicYear & { enrollments: Enrollment[] };

const AcademicYearListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    {
      header: "Academic Year",
      accessor: "year",
    },
    {
      header: "Start Date",
      accessor: "startDate",
    },
    {
      header: "End Date",
      accessor: "endDate",
    },
    {
      header: "Number of Students",
      accessor: "enrollmentsCount",
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

  const renderRow = (item: AcademicYearList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">{item.year}</td>
      <td className="p-4">{new Date(item.startDate).toLocaleDateString()}</td>
      <td className="p-4">{new Date(item.endDate).toLocaleDateString()}</td>
      <td className="hidden md:table-cell p-4">{item.enrollments?.length}</td>
      {role === "admin" && (
        <td className="p-4">
          <div className="flex items-center gap-2">
            <FormContainer table="academicYear" type="update" data={item} />
            <FormContainer table="academicYear" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  const { page, search, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.AcademicYearWhereInput = {};

  if (search) {
    query.OR = [
      { year: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "year":
            query.year = { equals: value };
            break;
          case "startDate":
            query.startDate = { gte: new Date(value) };
            break;
          case "endDate":
            query.endDate = { lte: new Date(value) };
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.academicYear.findMany({
      where: query,
      include: {
        students: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.academicYear.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Academic Years</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && <FormContainer table="academicYear" type="create" />}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default AcademicYearListPage;