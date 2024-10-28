import { Suspense } from 'react';
import { AppError, handleError } from '@/lib/error-handler';
import ErrorDisplay from '@/components/ErrorDisplay';
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import FeeTypeList from './FeeTypeList';

async function fetchFeeTypes(searchParams: { [key: string]: string | undefined }) {
  const { page, search, schoolId, sort, order, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.FeeTypeWhereInput = {};
  const orderBy: Prisma.FeeTypeOrderByWithRelationInput = {};

  // Add schoolId filter if provided
  if (schoolId) {
    query.schoolId = schoolId;
  }

  // Add search functionality
  if (search) {
    query.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Add sorting
  if (sort) {
    orderBy[sort as keyof Prisma.FeeTypeOrderByWithRelationInput] = order === 'desc' ? 'desc' : 'asc';
  } else {
    orderBy.createdAt = 'desc';
  }

  // Add additional filters
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        switch (key) {
          case "name":
            query.name = { equals: value };
            break;
          case "amount":
            query.amount = { equals: parseFloat(value) };
            break;
        }
      }
    });
  }

  try {
    const [data, count] = await prisma.$transaction([
      prisma.feeType.findMany({
        where: query,
        include: {
          school: true,
          feeStructures: true
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
        orderBy
      }),
      prisma.feeType.count({ where: query }),
    ]);

    return { data, count };
  } catch (error) {
    throw handleError(error);
  }
}

export default async function FeeTypeListPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FeeTypeListContent searchParams={searchParams} />
    </Suspense>
  );
}

async function FeeTypeListContent({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  try {
    const { data, count } = await fetchFeeTypes(searchParams);
    return <FeeTypeList data={data} count={count} searchParams={searchParams} />;
  } catch (error) {
    if (error instanceof AppError) {
      return <ErrorDisplay message={error?.message || "Something went wrong"} />;
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}