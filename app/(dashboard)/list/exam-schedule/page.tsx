import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { handleError, AppError } from '@/lib/error-handler';
import { Suspense } from "react";
import ExamScheduleList from './ExamScheduleList';
import ErrorDisplay from '@/components/ErrorDisplay';

async function fetchExamSchedules(searchParams: { [key: string]: string | undefined }) {
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

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

  try {
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

    return { data, count };
  } catch (error) {
    throw handleError(error);
  }
}
export default async function ExamScheduleListPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  return (
    <Suspense fallback={<div>Loading exam schedules...</div>}>
      <ExamScheduleListContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ExamScheduleListContent({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  try {
    const { data, count } = await fetchExamSchedules(searchParams);
    return <ExamScheduleList data={data} count={count} searchParams={searchParams} />;
  } catch (error) {
    if (error instanceof AppError) {
      return <ErrorDisplay message={error?.message || "Failed to fetch exam schedules"} />;
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}