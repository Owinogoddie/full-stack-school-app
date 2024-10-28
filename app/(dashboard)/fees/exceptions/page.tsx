// app/fee-exceptions/page.tsx
import { Suspense } from 'react';
import { AppError, handleError } from '@/lib/error-handler';
import ErrorDisplay from '@/components/ErrorDisplay';
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import {  Prisma, Student } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import FeeExceptionList from './FeeExceptionList';

export interface FeeExceptionListItem {
  id: string;
  student: Student;
  feeStructure: {
    id: string;
    // name: string;
    feeType: {
      id: string;
      name: string;
    };
    term: {
      id: string;
      name: string;
    } | null;
    academicYear: {
      id: number;
      year: string;
    };
  };
  feeStructureId: string;
  amount: number;
  reason: string;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}



interface FetchFeeExceptionsResult {
  data: FeeExceptionListItem[];
  count: number;
  role: string | undefined;
}

async function fetchFeeExceptions(
  searchParams: { [key: string]: string | undefined }
): Promise<FetchFeeExceptionsResult> {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.FeeExceptionWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "feeStructureId":
            query.feeStructureId = value;
            break;
          case "studentId":
            query.studentId = value;
            break;
          case "isActive":
            query.isActive = value === 'true';
            break;
          case "search":
            query.OR = [
              { student: { firstName: { contains: value, mode: "insensitive" } } },
              { student: { lastName: { contains: value, mode: "insensitive" } } },
              { reason: { contains: value, mode: "insensitive" } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS
  switch (role) {
    case "admin":
      break;
    case "student":
      query.studentId = currentUserId!;
      break;
    case "parent":
      query.student = {
        parentId: currentUserId!,
      };
      break;
    default:
      break;
  }

  try {
    const [data, count] = await prisma.$transaction([
      prisma.feeException.findMany({
        where: query,
        include: {
          feeStructure: {
            include: {
              feeType: true,
              term: true,    
              academicYear: true,
            }
          },
          student: true,
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.feeException.count({ where: query }),
    ]);
    

    return { data, count, role: role || 'user' };
  } catch (error) {
    throw handleError(error);
  }
}

export default async function FeeExceptionsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FeeExceptionsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function FeeExceptionsContent({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  try {
    const { data, count, role } = await fetchFeeExceptions(searchParams);
    return (
      <FeeExceptionList 
        data={data} 
        count={count} 
        searchParams={searchParams} 
        role={role || 'user'} 
      />
    );
  } catch (error) {
    if (error instanceof AppError) {
      return <ErrorDisplay message={error?.message || "Something went wrong"} />;
    }
    return <ErrorDisplay message="An unexpected error occurred" />;
  }
}