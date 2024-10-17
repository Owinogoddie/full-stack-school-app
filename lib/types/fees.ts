export type FeeStatus = 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CHECK';

export interface FeeTemplate {
  id: string;
  grades: string[];
  classes: string[];
  academicYearId: number;
  termId: string;
  feeTypeId: string;
  studentCategories: string[];
  baseAmount: number;
  version: number;
  isActive: boolean;
}

export interface FeeException {
  id: string;
  feeTemplateId: string;
  studentId: string;
  adjustedAmount: number;
  reason?: string;
  startDate: Date;
  endDate?: Date;
}

export interface FeeTransaction {
  id: string;
  amount: number;
  paymentDate: Date;
  method: PaymentMethod;
  studentId: string;
  feeTemplateId: string;
  termId: string;
  academicYearId: number;
  receiptNumber: string;
  status: FeeStatus;
  balance: number;
  isPartialPayment: boolean;
  notes?: string;
}