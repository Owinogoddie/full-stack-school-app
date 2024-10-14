import { Suspense } from 'react';
import { AppError, handleError } from '@/lib/error-handler';
import ErrorDisplay from '@/components/ErrorDisplay';
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import ParentList from './ParentList';

type SearchParams = { [key: string]: string | string[] | undefined };

async function fetchParents(searchParams: SearchParams) {
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page as string) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.ParentWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.OR = [
              { firstName: { contains: value as string, mode: "insensitive" } },
              { lastName: { contains: value as string, mode: "insensitive" } },
              { email: { contains: value as string, mode: "insensitive" } },
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
      prisma.parent.findMany({
        where: query,
        include: {
          students: true,
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
      }),
      prisma.parent.count({ where: query }),
    ]);

    return { data, count };
  } catch (error) {
    throw handleError(error);
  }
}

export default async function ParentListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ParentListContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ParentListContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  try {
    const { data, count } = await fetchParents(searchParams);
    return <ParentList data={data} count={count} searchParams={searchParams} />;
  } catch (error) {
    if (error instanceof AppError) {
      return <ErrorDisplay message={error?.message || "Something went wrong"} />;
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}