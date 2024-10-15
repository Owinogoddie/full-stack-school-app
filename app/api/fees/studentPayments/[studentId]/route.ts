import { NextResponse } from 'next/server';

// Dummy data (replace with database queries)
const studentPayments:any = {
  1: [
    { id: 1, amount: 1000, paymentDate: '2024-04-15', method: 'CASH', status: 'SUCCESS' },
  ],
  2: [
    { id: 2, amount: 3500, paymentDate: '2024-04-10', method: 'BANK_TRANSFER', status: 'SUCCESS' },
  ],
};

export async function GET(request: Request, { params }: { params: { studentId: string } }) {
  const studentId = params.studentId;
  const payments = studentPayments[studentId] || [];
  return NextResponse.json(payments);
}