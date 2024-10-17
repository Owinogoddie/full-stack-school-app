import { Suspense } from 'react';
import { AppError, handleError } from '@/lib/error-handler';
import ErrorDisplay from '@/components/ErrorDisplay';
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import TermList from './TermList';

async function fetchTerms(searchParams: { [key: string]: string | undefined }) {
  const { page, search, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.TermWhereInput = {};

  if (search) {
    query.OR = [
      { name: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "name":
            query.name = { equals: value };
            break;
          case "startDate":
            query.startDate = { gte: new Date(value) };
            break;
          case "endDate":
            query.endDate = { lte: new Date(value) };
            break;
          default:
            break;
        }
      }
    }
  }

  try {
    const [data, count] = await prisma.$transaction([
      prisma.term.findMany({
        where: query,
        include: {
          academicYear: true,
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
      }),
      prisma.term.count({ where: query }),
    ]);

    return { data, count };
  } catch (error) {
    throw handleError(error);
  }
}

export default async function TermListPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TermListContent searchParams={searchParams} />
    </Suspense>
  );
}

async function TermListContent({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  try {
    const { data, count } = await fetchTerms(searchParams);
    return <TermList data={data} count={count} searchParams={searchParams} />;
  } catch (error) {
    if (error instanceof AppError) {
      return <ErrorDisplay message={error?.message || "Something went wrong"} />;
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}