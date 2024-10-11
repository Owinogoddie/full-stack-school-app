import FormContainer from "@/components/form-container";
import Pagination from "@/components/pagination";
import Table from "@/components/table";
import TableSearch from "@/components/table-search";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Department, Prisma, Teacher } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import ClientOnlyComponent from "@/components/client-only-component";

type DepartmentList = Department & { headTeacher: Teacher | null, teachers: Teacher[] };

const DepartmentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

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
      header: "Head Teacher",
      accessor: "headTeacher",
      className: "hidden md:table-cell",
    },
    {
      header: "Teachers",
      accessor: "teachers",
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
  const MAX_DESCRIPTION_LENGTH = 20;

  const trimText = (text: string | undefined, maxLength: number) => {
    if (!text) return ""; // Return empty if no text is provided
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text; // Trim and add ellipsis
  };

  const renderTeachers = (teachers: Teacher[]) => {
    if (teachers.length === 0) return "No teachers";
    return teachers.map((teacher) => `${teacher.firstName} ${teacher.lastName}`).join(", ");
  };

  const renderRow = (item: DepartmentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">{item.name}</td>
      <td className="hidden md:table-cell p-4">{trimText(item.description || undefined, MAX_DESCRIPTION_LENGTH)}</td>
      <td className="hidden md:table-cell p-4 text-xs"> <p>{item.headTeacher?.firstName} {item.headTeacher?.lastName}</p> </td>
      <td className="hidden md:table-cell p-4">{renderTeachers(item.teachers)}</td>
      {role === "admin" && (
        <td className="p-4">
          <ClientOnlyComponent>
            <div className="flex items-center gap-2">
              <FormContainer table="department" type="update" data={item} />
              <FormContainer table="department" type="delete" id={item.id} />
            </div>
          </ClientOnlyComponent>
        </td>
      )}
    </tr>
  );

  const { page, search, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.DepartmentWhereInput = {};

  if (search) {
    query.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "name":
            query.name = { equals: value };
            break;
          case "schoolId":
            query.schoolId = { equals: value };
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.department.findMany({
      where: query,
      include: {
        headTeacher: true,
        teachers: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.department.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Departments</h1>
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
              {role === "admin" && <FormContainer table="department" type="create" />}
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

export default DepartmentListPage;
