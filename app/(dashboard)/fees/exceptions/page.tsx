// app/fee-exceptions/page.tsx
import { Suspense } from 'react';
import { AppError, handleError } from '@/lib/error-handler';
import ErrorDisplay from '@/components/ErrorDisplay';
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { ExceptionStatus, ExceptionType, FeeTemplate, FeeType, Prisma, Student } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import FeeExceptionList from './FeeExceptionList';

export interface FeeExceptionListItem {
  id: string;
  student: Student;
  feeType: FeeType;
  feeTemplate: (FeeTemplate & {
    feeType: FeeType;
  }) | null;
  status: ExceptionStatus;
  exceptionType: ExceptionType;
  amount: number | null;
  percentage: number | null;
  startDate: Date;
  endDate: Date | null;
  description: string | null;
  approvedBy: string | null;
  reason: string | null;
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
          case "feeTemplateId":
            query.feeTemplateId = value;
            break;
          case "feeTypeId":
            query.feeTypeId = value;
            break;
          case "studentId":
            query.studentId = value;
            break;
          case "exceptionType":
            query.exceptionType = value as ExceptionType;
            break;
          case "status":
            query.status = value as ExceptionStatus;
            break;
          case "search":
            query.OR = [
              { student: { firstName: { contains: value, mode: "insensitive" } } },
              { student: { lastName: { contains: value, mode: "insensitive" } } },
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
          feeTemplate: {
            include: {
              feeType: true,
            },
          },
          feeType: true,
          student: true,
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
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