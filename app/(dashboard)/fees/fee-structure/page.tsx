// app/feeStructures/page.tsx
import { Suspense } from 'react';
import { AppError, handleError } from '@/lib/error-handler';
import ErrorDisplay from '@/components/ErrorDisplay';
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import FeeStructureList from './FeeStructureList';

async function fetchFeeStructures(searchParams: { [key: string]: string | undefined }) {
  const { page, search, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.FeeStructureWhereInput = {};

  if (search) {
    query.OR = [
      { feeType: { name: { contains: search, mode: 'insensitive' } } },
      { categories: { some: { name: { contains: search, mode: 'insensitive' } } } },
      // { grades: { some: { levelName: { equals: search.toUpperCase() } } } },
      { classes: { some: { name: { contains: search, mode: 'insensitive' } } } },
      { academicYear: { year: { contains: search, mode: 'insensitive' } } },
    ];
  }

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "academicYearId":
            query.academicYearId = parseInt(value);
            break;
          case "termId":
            query.termId = value;
            break;
          case "feeTypeId":
            query.feeTypeId = value;
            break;
          case "categoryIds":
            query.categories = {
              some: {
                id: {
                  in: value.split(',')
                }
              }
            };
            break;
          case "gradeIds":
            query.grades = {
              some: {
                id: {
                  in: value.split(',').map(id => parseInt(id))
                }
              }
            };
            break;
          case "classIds":
            query.classes = {
              some: {
                id: {
                  in: value.split(',').map(id => parseInt(id))
                }
              }
            };
            break;
          default:
            break;
        }
      }
    }
  }

  try {
    const [data, count] = await prisma.$transaction([
      prisma.feeStructure.findMany({
        where: query,
        include: {
          feeType: true,
          categories: true,
          grades: true,
          classes: true,
          academicYear: true,
          term: true,
          specialProgrammes: true,
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.feeStructure.count({ where: query }),
    ]);

    return { data, count };
  } catch (error) {
    console.error("Error in fetchFeeStructures:", error);
    throw handleError(error);
  }
}

interface PageProps {
  searchParams: { [key: string]: string | undefined };
}

export default async function FeeStructureListPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FeeStructureListContent searchParams={searchParams} />
    </Suspense>
  );
}

async function FeeStructureListContent({ searchParams }: PageProps) {
  try {
    const { data, count } = await fetchFeeStructures(searchParams);
    return <FeeStructureList data={data} count={count} searchParams={searchParams} />;
  } catch (error) {
    if (error instanceof AppError) {
      return <ErrorDisplay message={error?.message || "Something went wrong"} />;
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}