import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const classId = searchParams.get('classId');

  if (!classId) {
    return NextResponse.json({ message: 'Invalid classId' }, { status: 400 });
  }

  try {
    console.log(classId)
    const students = await prisma.student.findMany({
      where: {
        classId: parseInt(classId, 10),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        admissionNumber: true,
      },
    });
    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ message: 'Error fetching students' }, { status: 500 });
  }
}