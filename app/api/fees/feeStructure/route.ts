import { NextResponse } from 'next/server';

// Dummy data (replace with database queries)
const feeStructure = [
  { id: 1, classId: '1', academicYear: '2024', termId: 'Term 1', feeTypeId: 1, studentCategoryId: 1, baseAmount: 5000 },
  { id: 2, classId: '1', academicYear: '2024', termId: 'Term 1', feeTypeId: 2, studentCategoryId: 1, baseAmount: 1000 },
  { id: 3, classId: '1', academicYear: '2024', termId: 'Term 1', feeTypeId: 1, studentCategoryId: 2, baseAmount: 7000 },
  { id: 4, classId: '2', academicYear: '2024', termId: 'Term 1', feeTypeId: 1, studentCategoryId: 1, baseAmount: 5500 },
];

export async function GET() {
  return NextResponse.json(feeStructure);
}

// export async function POST(request: Request) {
// //   const body = await request.json();
//   // Here you would validate and save the new fee structure to the database
//   return NextResponse.json({ message: 'Fee structure added successfully' }, { status: 201 });
// }