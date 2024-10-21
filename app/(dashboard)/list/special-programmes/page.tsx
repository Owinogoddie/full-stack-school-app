// app/(dashboard)/special-programmes/page.tsx
import { Suspense } from 'react';
import { AppError, handleError } from '@/lib/error-handler';
import ErrorDisplay from '@/components/ErrorDisplay';
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import SpecialProgrammeList from './SpecialProgrammeList';

async function fetchSpecialProgrammes(searchParams: { [key: string]: string | undefined }) {
    // console.log("searchParams: ", searchParams);
    const { page, search } = searchParams;
    const p = page ? parseInt(page) : 1;
  
    const query: Prisma.SpecialProgrammeWhereInput = {};
    if (search) {
      query.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    console.log("Query: ", query);
  
    try {
      const [data, count] = await prisma.$transaction([
        prisma.specialProgramme.findMany({
          where: query,
          include: {
            grades: true,
            classes: true,
            students: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          take: ITEM_PER_PAGE,
          skip: ITEM_PER_PAGE * (p - 1),
        }),
        prisma.specialProgramme.count({ where: query }),
      ]);
  
      return { data, count };
    } catch (error) {
      console.log("Error fetching data: ", error);
      throw handleError(error);
    }
  }
  

export default async function SpecialProgrammeListPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SpecialProgrammeListContent searchParams={searchParams} />
    </Suspense>
  );
}

async function SpecialProgrammeListContent({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  try {
    const { data, count } = await fetchSpecialProgrammes(searchParams);
    return <SpecialProgrammeList data={data} count={count} searchParams={searchParams} />;
  } catch (error) {
    if (error instanceof AppError) {
      return <ErrorDisplay message={error?.message || "Something went wrong"} />;
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}