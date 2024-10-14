// app/list/subjects/page.tsx
import { Suspense } from 'react';
import { AppError, handleError } from '@/lib/error-handler';
import ErrorDisplay from '@/components/ErrorDisplay';
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma, Subject } from "@prisma/client";
import SubjectList from './SubjectList';
import FullScreenLoader from '@/components/full-screen-loader';

type SubjectWithRelations = Subject & {
  parent: (Subject & { name: string }) | null;
  children: (Subject & { name: string })[];
  relatedTo: (Subject & { name: string })[];
};

async function fetchSubjects(searchParams: { [key: string]: string | undefined }): Promise<{ data: SubjectWithRelations[], count: number }> {
  const { page, search, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.SubjectWhereInput = {};

  if (search) {
    query.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "name":
            query.name = { equals: value };
            break;
          case "code":
            query.code = { equals: value };
            break;
          default:
            break;
        }
      }
    }
  }

  try {
    const [data, count] = await prisma.$transaction([
      prisma.subject.findMany({
        where: query,
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
        include: {
          parent: true,
          children: true,
          relatedTo: true,
        },
      }),
      prisma.subject.count({ where: query }),
    ]);

    return { data: data as SubjectWithRelations[], count };
  } catch (error) {
    throw handleError(error);
  }
}

export default async function SubjectListPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <SubjectListContent searchParams={searchParams} />
    </Suspense>
  );
}

async function SubjectListContent({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  try {
    const { data, count } = await fetchSubjects(searchParams);
    return <SubjectList data={data} count={count} searchParams={searchParams} />;
  } catch (error) {
    if (error instanceof AppError) {
      return <ErrorDisplay message={error?.message || "Something went wrong"} />;
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}
