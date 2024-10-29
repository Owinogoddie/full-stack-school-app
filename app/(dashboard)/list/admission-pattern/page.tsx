// app/settings/admission-pattern/page.tsx
import { Suspense } from 'react';
import { AppError, handleError } from '@/lib/error-handler';
import ErrorDisplay from '@/components/ErrorDisplay';
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import AdmissionPatternList from './AdmissionPatternList';

async function fetchAdmissionPatterns(searchParams: { [key: string]: string | undefined }) {
  const { page, search, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.AdmissionNumberPatternWhereInput = {};

  if (search) {
    query.OR = [
      { prefix: { contains: search, mode: 'insensitive' } },
      { school: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "prefix":
            query.prefix = { equals: value };
            break;
          case "yearFormat":
            // Remove the type assertion since we're matching the Prisma model
            query.yearFormat = value;
            break;
          case "digitCount":
            query.digitCount = parseInt(value);
            break;
          case "schoolId":
            query.schoolId = value;
            break;
          default:
            break;
        }
      }
    }
  }

  try {
    const [data, count] = await prisma.$transaction([
      prisma.admissionNumberPattern.findMany({
        where: query,
        include: {
          school: {
            select: {
              name: true,
            },
          },
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
      }),
      prisma.admissionNumberPattern.count({ where: query }),
    ]);

    return { data, count };
  } catch (error) {
    throw handleError(error);
  }
}

export default async function AdmissionPatternListPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdmissionPatternListContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AdmissionPatternListContent({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  try {
    const { data, count } = await fetchAdmissionPatterns(searchParams);
    return <AdmissionPatternList data={data} count={count} searchParams={searchParams} />;
  } catch (error) {
    if (error instanceof AppError) {
      return <ErrorDisplay message={error?.message || "Something went wrong"} />;
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}