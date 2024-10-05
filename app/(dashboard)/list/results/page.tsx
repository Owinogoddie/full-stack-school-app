import FormContainer from "@/components/form-container";
import Pagination from "@/components/pagination";
import Table from "@/components/table";
import TableSearch from "@/components/table-search";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import {
  Prisma,
  Result,
  Student,
  Subject,
  AcademicYear,
  Grade,
  Class,
  Exam,
  GradeScale,
} from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import ClientOnlyComponent from "@/components/client-only-component";
import Link from "next/link";

type ResultWithIncludes = Result & {
  student: Student;
  exam: Exam;
  subject: Subject;
  academicYear: AcademicYear;
  grade: Grade;
  class: Class | null;
  gradeScale: GradeScale;
};

type ResultList = ResultWithIncludes & {
  studentName: string;
  examName: string;
  subjectName: string;
  academicYearName: string;
  gradeName: string;
  className: string | null;
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
    { header: "Exam", accessor: "examName" },
    { header: "Subject", accessor: "subjectName" },
    { header: "Academic Year", accessor: "academicYearName" },
    { header: "Grade", accessor: "gradeName" },
    { header: "Class", accessor: "className" },
    { header: "Score", accessor: "score" },
    { header: "Result Grade", accessor: "resultGrade" },
    { header: "Remarks", accessor: "remarks" },
    ...(role === "admin" || role === "teacher"
      ? [{ header: "Actions", accessor: "action" }]
      : []),
  ];

  const renderRow = (item: ResultList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">{item.studentName}</td>
      <td>{item.examName}</td>
      <td>{item.subjectName}</td>
      <td>{item.academicYearName}</td>
      <td>{item.gradeName}</td>
      <td>{item.className || "N/A"}</td>
      <td>{item.score}</td>
      <td>{item.resultGrade || "N/A"}</td>
      <td>{item.remarks || "N/A"}</td>
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
              {
                student: {
                  firstName: { contains: value, mode: "insensitive" },
                },
              },
              {
                student: { lastName: { contains: value, mode: "insensitive" } },
              },
              { subject: { name: { contains: value, mode: "insensitive" } } },
              { exam: { title: { contains: value, mode: "insensitive" } } },
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
        exam: true,
        subject: true,
        academicYear: true,
        grade: true,
        class: true,
        gradeScale: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.result.count({ where: query }),
  ]);

  const data: ResultList[] = dataRes.map((item: ResultWithIncludes) => ({
    ...item,
    studentName: `${item.student.firstName} ${item.student.lastName}`,
    examName: item.exam.title,
    subjectName: item.subject.name,
    academicYearName: item.academicYear.year,
    gradeName: item.grade.levelName,
    className: item.class?.name || null,
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
                <>
                  <FormContainer table="result" type="create" />
                  <Link
                    href="/list/results/results/bulk-add"
                    className="px-4 py-2 bg-lamaBlue text-blue-500 rounded-md hover:bg-lamaBlue-dark"
                  >
                    Bulk Add
                  </Link>
                </>
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
