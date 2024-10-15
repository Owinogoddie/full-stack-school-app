import { NextResponse } from 'next/server';

// Dummy data (replace with database queries)
const studentFees:any = {
  1: [
    { id: 1, feeTypeId: 1, amount: 5000, finalAmount: 5000, dueDate: '2024-05-01', status: 'PENDING' },
    { id: 2, feeTypeId: 2, amount: 1000, finalAmount: 1000, dueDate: '2024-05-01', status: 'PAID' },
  ],
  2: [
    { id: 3, feeTypeId: 1, amount: 7000, finalAmount: 7000, dueDate: '2024-05-01', status: 'PARTIALLY_PAID' },
  ],
};

export async function GET(request: Request, { params }: { params: { studentId: string } }) {
  const studentId = params.studentId;
  const fees = studentFees[studentId] || [];
  return NextResponse.json(fees);
}