import { Suspense } from 'react';
import { AppError, handleError } from '@/lib/error-handler';
import ErrorDisplay from '@/components/ErrorDisplay';
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import ExamList from './ExamList';
import { auth } from "@clerk/nextjs/server";

async function fetchExams(searchParams: { [key: string]: string | undefined }) {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.ExamWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "gradeId":
            query.gradeId = parseInt(value);
            break;
          case "subjectId":
            query.subjectId = parseInt(value);
            break;
          case "academicYearId":
            query.academicYearId = parseInt(value);
            break;
          case "search":
            query.subject = {
              name: { contains: value, mode: "insensitive" },
            };
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS
  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.lesson = {
        teacherId: currentUserId!,
      };
      break;
    case "student":
      query.grade = {
        students: {
          some: {
            id: currentUserId!,
          },
        },
      };
      break;
    case "parent":
      query.grade = {
        students: {
          some: {
            parentId: currentUserId!,
          },
        },
      };
      break;
    default:
      break;
  }

  try {
    const [data, count] = await prisma.$transaction([
      prisma.exam.findMany({
        where: query,
        include: {
          subject: true,
          grade: true,
          academicYear: true,
          lesson: {
            select: {
              class: { select: { name: true } },
              teacher: { select: { firstName: true, lastName: true } },
            },
          },
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
      }),
      prisma.exam.count({ where: query }),
    ]);

    return { data, count, role };
  } catch (error) {
    throw handleError(error);
  }
}

export default async function ExamListPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ExamListContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ExamListContent({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  try {
    const { data, count, role } = await fetchExams(searchParams);
    return <ExamList data={data} count={count} searchParams={searchParams} role={role} />;
  } catch (error) {
    if (error instanceof AppError) {
      return <ErrorDisplay message={error?.message || "Something went wrong"} />;
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}