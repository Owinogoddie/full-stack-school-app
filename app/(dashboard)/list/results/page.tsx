// ResultListPage.tsx
import { Suspense } from 'react';
import { AppError, handleError } from '@/lib/error-handler';
import ErrorDisplay from '@/components/ErrorDisplay';
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import ResultList from './ResultList';

async function fetchResults(searchParams: { [key: string]: string | undefined }) {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

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
          case "classId":
            query.classId = parseInt(value);
            break;
          case "subjectId":
            query.subjectId = parseInt(value);
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

  try {
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

    const data = dataRes.map((item) => ({
      ...item,
      studentName: `${item.student.firstName} ${item.student.lastName}`,
      examName: item.exam.title,
      subjectName: item.subject.name,
      academicYearName: item.academicYear.year,
      gradeName: item.grade.levelName,
      className: item.class?.name || null,
    }));

    return { data, count, role };
  } catch (error) {
    throw handleError(error);
  }
}

export default async function ResultListPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultListContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ResultListContent({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  try {
    const { data, count, role } = await fetchResults(searchParams);
    return <ResultList data={data} count={count} searchParams={searchParams} role={role} />;
  } catch (error) {
    if (error instanceof AppError) {
      return <ErrorDisplay message={error?.message || "Something went wrong"} />;
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}