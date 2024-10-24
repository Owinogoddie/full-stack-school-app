// app/(dashboard)/fees/page.tsx
import { Suspense } from 'react';
import { AppError, handleError } from '@/lib/error-handler';
import ErrorDisplay from '@/components/ErrorDisplay';
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import FeeList from './FeeList';

async function fetchFees(searchParams: { [key: string]: string | undefined }) {
  const { page, search, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.FeeWhereInput = {};

  if (search) {
    query.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "templateId":
            query.templateId = value;
            break;
          case "termId":
            query.termId = value;
            break;
          case "academicYearId":
            query.academicYearId = parseInt(value);
            break;
          default:
            break;
        }
      }
    }
  }

  try {
    const [data, count] = await prisma.$transaction([
      prisma.fee.findMany({
        where: query,
        include: {
          template: {
            include: {
              feeType: true,
            }
          },
          term: true,
          academicYear: true,
          grades: true,
          classes: true,
          studentCategories: true,
          specialPrograms: true,
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
      }),
      prisma.fee.count({ where: query }),
    ]);

    return { data, count };
  } catch (error) {
    throw handleError(error);
  }
}

export default async function FeeListPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FeeListContent searchParams={searchParams} />
    </Suspense>
  );
}

async function FeeListContent({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  try {
    const { data, count } = await fetchFees(searchParams);
    return <FeeList data={data} count={count} searchParams={searchParams} />;
  } catch (error) {
    if (error instanceof AppError) {
      return <ErrorDisplay message={error?.message || "Something went wrong"} />;
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}