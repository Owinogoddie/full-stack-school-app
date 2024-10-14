import { Suspense } from 'react';
import { AppError, handleError } from '@/lib/error-handler';
import ErrorDisplay from '@/components/ErrorDisplay';
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma, ExamType } from "@prisma/client";
import GradeScaleList from './GradeScaleList';

type SearchParams = { [key: string]: string | string[] | undefined };

async function fetchGradeScales(searchParams: SearchParams) {
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page as string) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.GradeScaleWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "schoolId":
            query.schoolId = value as string;
            break;
          case "examType":
            query.examTypes = { has: value as ExamType };
            break;
          case "search":
            query.name = { contains: value as string, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  try {
    const [rawData, count] = await prisma.$transaction([
      prisma.gradeScale.findMany({
        where: query,
        include: {
          school: true,
          ranges: true,
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
      }),
      prisma.gradeScale.count({ where: query }),
    ]);

    // Transform the data to match GradeScaleWithRelations type
    const data = rawData.map(item => ({
      ...item,
      school: item.school || undefined
    }));

    return { data, count };
  } catch (error) {
    throw handleError(error);
  }
}
export default async function GradeScaleListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GradeScaleListContent searchParams={searchParams} />
    </Suspense>
  );
}

async function GradeScaleListContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  try {
    const { data, count } = await fetchGradeScales(searchParams);
    return <GradeScaleList data={data} count={count} searchParams={searchParams} />;
  } catch (error) {
    if (error instanceof AppError) {
      return <ErrorDisplay message={error?.message || "Something went wrong"} />;
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}