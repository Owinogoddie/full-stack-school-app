// types/fee.ts
import type { Student, FeeException, FeeStatus } from '@prisma/client';

export type UnpaidFeeItem = {
  feeStructureId: string;
  feeType: string;
  originalAmount: number;
  applicableAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: Date;
  isOverdue: boolean;
  hasException: boolean;
  exception: FeeException | null;
  status: FeeStatus['status'];
};

export type FeeSummary = {
  totalOriginalAmount: number;
  totalApplicableAmount: number;
  totalPaidAmount: number;
  totalRemainingAmount: number;
  availableExcessFees: number;
  finalRemainingAmount: number;
};

export type StudentFeeDetails = {
  student: Pick<Student, 'id' | 'upi' | 'admissionNumber' | 'firstName' | 'lastName' | 'gender' | 'status'> & {
    grade: string;
    class?: string;
    categories: string[];
    specialProgrammes: string[];
  };
  feeSummary: FeeSummary;
  unpaidFees: UnpaidFeeItem[];
};

export type UnpaidFeesResponse = StudentFeeDetails[];