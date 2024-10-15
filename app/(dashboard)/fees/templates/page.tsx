// File: app/feeTemplates/page.tsx

import { Suspense } from 'react';
import { AppError, handleError } from '@/lib/error-handler';
import ErrorDisplay from '@/components/ErrorDisplay';
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import FeeTemplateList from './FeeTemplateList';

async function fetchFeeTemplates(searchParams: { [key: string]: string | undefined }) {
  const { page, search, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.FeeTemplateWhereInput = {};

  if (search) {
    query.OR = [
      { academicYear: { year: { contains: search, mode: 'insensitive' } } },
    ];
  }

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "gradeId":
            query.grades = { some: { id: parseInt(value) } };
            break;
          case "classId":
            query.classes = { some: { id: parseInt(value) } };
            break;
            case "academicYearId":
              query.academicYearId = parseInt(value);
              break;
          case "termId":
            query.termId = { equals: value };
            break;
          case "feeTypeId":
            query.feeTypeId = { equals: value };
            break;
          case "studentCategoryId":
            query.studentCategories = { some: { id: value } };
            break;
          default:
            break;
        }
      }
    }
  }

  try {
    const [data, count] = await prisma.$transaction([
      prisma.feeTemplate.findMany({
        where: query,
        include: {
          grades: true,
          classes: true,
          term: true,
          feeType: true,
          studentCategories: true,
          academicYear: true,
          // school: true,
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
      }),
      prisma.feeTemplate.count({ where: query }),
    ]);

    return { data, count };
  } catch (error) {
    throw handleError(error);
  }
}

export default async function FeeTemplateListPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FeeTemplateListContent searchParams={searchParams} />
    </Suspense>
  );
}

async function FeeTemplateListContent({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  try {
    const { data, count } = await fetchFeeTemplates(searchParams);
    return <FeeTemplateList data={data} count={count} searchParams={searchParams} />;
  } catch (error) {
    if (error instanceof AppError) {
      return <ErrorDisplay message={error?.message || "Something went wrong"} />;
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}