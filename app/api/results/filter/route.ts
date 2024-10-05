// File: /app/api/results/filter/route.ts

import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');
    const subjectId = searchParams.get('subjectId');
    const academicYearId = searchParams.get('academicYearId');
    const classId = searchParams.get('classId');
    const gradeId = searchParams.get('gradeId');  // Changed from gradeScaleId
    const search = searchParams.get('search');
    const page = searchParams.get('page');
    const exportAll = searchParams.get('export') === 'true';

    const query: any = {};

    if (examId) query.examId = parseInt(examId);
    if (subjectId) query.subjectId = parseInt(subjectId);
    if (academicYearId) query.academicYearId = parseInt(academicYearId);
    if (classId) query.classId = parseInt(classId);
    if (gradeId) query.gradeId = parseInt(gradeId);  // Changed from gradeScaleId
   
    if (search) {
      query.OR = [
        { student: { firstName: { contains: search, mode: 'insensitive' } } },
        { student: { lastName: { contains: search, mode: 'insensitive' } } },
        { subject: { name: { contains: search, mode: 'insensitive' } } },
        { exam: { title: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const results = await prisma.result.findMany({
      where: query,
      include: {
        student: true,
        exam: true,
        subject: true,
        academicYear: true,
        grade: true,
        class: true,
        // Removed gradeScale from include
      },
      ...(exportAll ? {} : {
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (parseInt(page || '1') - 1),
      }),
    });

    const count = await prisma.result.count({ where: query });

    const formattedResults = results.map(result => ({
      id: result.id,
      studentName: `${result.student.firstName} ${result.student.lastName}`,
      examName: result.exam.title,
      subjectName: result.subject.name,
      academicYearName: result.academicYear.year,
      gradeName: result.grade.levelName,
      className: result.class?.name || 'N/A',
      score: result.score,
      resultGrade: result.resultGrade || 'N/A',
      remarks: result.remarks || 'N/A',
    }));

    return NextResponse.json({ results: formattedResults, count });
}