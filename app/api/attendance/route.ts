// app/api/attendance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { attendanceSchema } from '@/schemas/attendance-schema';

export async function GET(request: NextRequest) {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (role !== 'admin' && role !== 'teacher') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');
  const date = searchParams.get('date');

  if (!classId || !date) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const students = await prisma.student.findMany({
      where: { classId: parseInt(classId) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        attendances: {
          where: { date: new Date(date) },
          select: { status: true },
        },
      },
    });

    const formattedStudents = students.map(student => ({
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      status: student.attendances[0]?.status || 'ABSENT',
    }));

    return NextResponse.json({ students: formattedStudents });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (role !== 'admin' && role !== 'teacher') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validatedData = attendanceSchema.parse(body);

    const { date, classId, students } = validatedData;

    const attendanceRecords = students.map(student => ({
      date: new Date(date),
      status: student.status,
      studentId: student.id,
      classId: parseInt(classId),
    }));

    await prisma.$transaction(
      attendanceRecords.map(record =>
        prisma.attendance.upsert({
          where: {
            date_studentId: {
              date: record.date,
              studentId: record.studentId,
            },
          },
          update: { status: record.status },
          create: record,
        })
      )
    );

    return NextResponse.json({ message: 'Attendance submitted successfully' });
  } catch (error) {
    console.error('Error submitting attendance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}