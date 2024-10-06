import FormContainer from "@/components/form-container";
import Pagination from "@/components/pagination";
import Table from "@/components/table";
import TableSearch from "@/components/table-search";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Subject, Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import ClientOnlyComponent from "@/components/client-only-component";

const SubjectListPage = async ({
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
      header: "Code",
      accessor: "code",
    },
    {
      header: "Description",
      accessor: "description",
      className: "hidden md:table-cell",
    },
    {
      header: "Parent Subject",
      accessor: "parentInfo",
      className: "hidden lg:table-cell",
    },
    {
      header: "Related Subjects",
      accessor: "relatedInfo",
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

  const MAX_DESCRIPTION_LENGTH = 20;
  const MAX_RELATED_ITEMS = 3;

  const trimText = (text: string | undefined, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const getParentInfo = (item: Subject & { parent?: Subject | null }) => {
    return item.parent ? item.parent.name : "None";
  };

  const getRelatedInfo = (item: Subject & {
    children: Subject[];
    relatedTo: Subject[];
  }) => {
    const relatedSubjects = [
      ...item.children,
      ...item.relatedTo,
    ];

    if (relatedSubjects.length === 0) {
      return "None";
    }

    return relatedSubjects
      .slice(0, MAX_RELATED_ITEMS)
      .map((subject) => subject.name)
      .join(", ") + (relatedSubjects.length > MAX_RELATED_ITEMS ? "..." : "");
  };

  const renderRow = (item: Subject & {
    parent?: Subject | null;
    children: Subject[];
    relatedTo: Subject[];
  }) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">{item.name}</td>
      <td className="p-4">{item.code}</td>
      <td className="hidden md:table-cell p-4">{trimText(item.description || "", MAX_DESCRIPTION_LENGTH)}</td>
      <td className="hidden lg:table-cell p-4">{getParentInfo(item)}</td>
      <td className="hidden lg:table-cell p-4">{getRelatedInfo(item)}</td>
      {role === "admin" && (
        <td className="p-4">
          <ClientOnlyComponent>
            <div className="flex items-center gap-2">
              <FormContainer table="subject" type="update" data={item} />
              <FormContainer table="subject" type="delete" id={item.id} />
            </div>
          </ClientOnlyComponent>
        </td>
      )}
    </tr>
  );

  const { page, search, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.SubjectWhereInput = {};

  if (search) {
    query.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
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
          case "code":
            query.code = { equals: value };
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.subject.findMany({
      where: query,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      include: {
        parent: { select: { name: true } },
        children: { select: { name: true } },
        relatedTo: { select: { name: true } },
      },
    }),
    prisma.subject.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Subjects</h1>
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
              {role === "admin" && <FormContainer table="subject" type="create" />}
            </div>
          </div>
        </ClientOnlyComponent>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default SubjectListPage;