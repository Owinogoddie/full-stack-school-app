import FormContainer from "@/components/form-container";
import Pagination from "@/components/pagination";
import Table from "@/components/table";
import TableSearch from "@/components/table-search";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma, Result, Student, Subject, AcademicYear, Grade, Class, ExamType } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import ClientOnlyComponent from "@/components/client-only-component";

type ResultWithIncludes = Result & {
  student: Student;
  subject: Subject;
  academicYear: AcademicYear;
  grade: Grade;
  class: Class | null;
};

type ResultList = {
  id: number;
  studentName: string;
  subjectName: string;
  score: number;
  resultgrade: string | null;
  className: string | null;
  term: number;
  examType: ExamType;
};

const ResultListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const columns = [
    { header: "Student", accessor: "studentName" },
    { header: "Subject", accessor: "subjectName" },
    { header: "Score", accessor: "score" },
    { header: "Grade", accessor: "resultgrade" },
    { header: "Class", accessor: "className" },
    { header: "Term", accessor: "term" },
    { header: "Exam Type", accessor: "examType" },
    ...(role === "admin" || role === "teacher" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: ResultList) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="p-4">{item.studentName}</td>
      <td>{item.subjectName}</td>
      <td>{item.score}</td>
      <td>{item.resultgrade || 'N/A'}</td>
      <td>{item.className || 'N/A'}</td>
      <td>{item.term}</td>
      <td>{item.examType}</td>
      <td>
        <ClientOnlyComponent>
          <div className="flex items-center gap-2">
            {(role === "admin" || role === "teacher") && (
              <>
                <FormContainer table="result" type="update" data={item} />
                <FormContainer table="result" type="delete" id={item.id} />
              </>
            )}
          </div>
        </ClientOnlyComponent>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.ResultWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "studentId":
            query.studentId = value;
            break;
          case "search":
            query.OR = [
              { student: { firstName: { contains: value, mode: "insensitive" } } },
              { student: { lastName: { contains: value, mode: "insensitive" } } },
              { subject: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  switch (role) {
    case "admin":
      break;
    case "teacher":
      // Adjust this based on how teachers are related to results in your schema
      query.subject = { teachers: { some: { id: currentUserId! } } };
      break;
    case "student":
      query.studentId = currentUserId!;
      break;
    case "parent":
      query.student = { parentId: currentUserId! };
      break;
    default:
      break;
  }

  const [dataRes, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: true,
        subject: true,
        academicYear: true,
        grade: true,
        class: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.result.count({ where: query }),
  ]);

  const data: ResultList[] = dataRes.map((item: ResultWithIncludes) => ({
    id: item.id,
    studentName: `${item.student.firstName} ${item.student.lastName}`,
    subjectName: item.subject.name,
    score: item.score,
    resultgrade: item.resultgrade,
    className: item.class?.name || null,
    term: item.term,
    examType: item.examType,
  }));

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Results</h1>
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
                <FormContainer table="result" type="create" />
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

export default ResultListPage;