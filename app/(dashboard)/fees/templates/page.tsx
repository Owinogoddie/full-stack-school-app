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
      { feeType: { name: { contains: search, mode: 'insensitive' } } },
      { term: { name: { contains: search, mode: 'insensitive' } } },
      { specialProgramme: { name: { contains: search, mode: 'insensitive' } } },
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
          case "studentCategoryId":
            query.studentCategories = { some: { id: value } };
            break;
          case "specialProgrammeId":
            query.specialProgrammeId = value;
            break;
          default:
            break;
        }
      }
    }
  }

  try {
    const [rawData, count] = await prisma.$transaction([
      prisma.feeTemplate.findMany({
        where: query,
        include: {
          term: true,
          feeType: true,
          studentCategories: true,
          academicYear: true,
          specialProgramme: true,
          feeTemplateGradeClasses: {
            include: {
              grade: true,
              class: true,
            },
          }, // Include grade and class in FeeTemplateGradeClass
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
      }),
      prisma.feeTemplate.count({ where: query }),
    ]);

    // Transform gradeClasses into the needed format
    const data = rawData.map((item) => ({
      ...item,
      gradeClasses: item.feeTemplateGradeClasses.map(gc => ({
        gradeId: gc.gradeId,
        gradeName: gc.grade.levelName,
        classes: [{ id: gc.classId, name: gc.class.name }],
      })),
    }));

    return { data, count };
  } catch (error) {
    console.error("Error in fetchFeeTemplates:", error);
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
