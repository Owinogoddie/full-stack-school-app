// app/grades/page.tsx

import { Suspense } from 'react';
import { AppError, handleError } from '@/lib/error-handler';
import ErrorDisplay from '@/components/ErrorDisplay';
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma, GradeLevel, Stage } from "@prisma/client";
import GradeList from './GradeList';

// type GradeListType = Grade & { enrollments: Enrollment[] };

async function fetchGrades(searchParams: { [key: string]: string | undefined }) {
  const { page, search, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.GradeWhereInput = {};

  if (search) {
    query.OR = [
      { levelName: { in: Object.values(GradeLevel).filter(level => level.toLowerCase().includes(search.toLowerCase())) as GradeLevel[] } },
      { stage: { in: Object.values(Stage).filter(stage => stage.toLowerCase().includes(search.toLowerCase())) as Stage[] } },
    ];
  }
  
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "levelName":
            query.levelName = { equals: value as GradeLevel };
            break;
          case "stage":
            query.stage = { equals: value as Stage };
            break;
          default:
            break;
        }
      }
    }
  }

  try {
    const [data, count] = await prisma.$transaction([
      prisma.grade.findMany({
        where: query,
        include: {
          enrollments: true,
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
      }),
      prisma.grade.count({ where: query }),
    ]);

    return { data, count };
  } catch (error) {
    throw handleError(error);
  }
}

export default async function GradeListPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GradeListContent searchParams={searchParams} />
    </Suspense>
  );
}

async function GradeListContent({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  try {
    const { data, count } = await fetchGrades(searchParams);
    return <GradeList data={data} count={count} searchParams={searchParams} />;
  } catch (error:any) {
    if (error instanceof AppError) {
      return <ErrorDisplay message={error?.message || "Something went wrong"} />;
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}