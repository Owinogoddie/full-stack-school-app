import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const academicYearId = searchParams.get('academicYearId');
  const examIds = searchParams.getAll('examIds[]');
  const gradeId = searchParams.get('gradeId');
  const classId = searchParams.get('classId');
  const subjectIds = searchParams.getAll('subjectIds[]');
  const order = searchParams.get('order') || 'desc';
  const search = searchParams.get('search') || '';

  if (!academicYearId || examIds.length === 0 || (!gradeId && !classId) || subjectIds.length === 0) {
    return NextResponse.json({ ranking: [] });
  }

  const query: any = {
    academicYearId: parseInt(academicYearId),
    examId: { in: examIds.map(id => parseInt(id)) },
    subjectId: { in: subjectIds.map(id => parseInt(id)) },
  };

  if (gradeId) query.gradeId = parseInt(gradeId);
  if (classId) query.classId = parseInt(classId);

  const results = await prisma.result.findMany({
    where: query,
    include: {
      student: true,
      exam: true,
      subject: true,
      grade: true,
      class: true,
    },
  });

  // Group results by student and subject
  const studentResults = results.reduce((acc: any, result: any) => {
    if (!acc[result.studentId]) {
      acc[result.studentId] = {
        student: result.student,
        subjects: {},
        totalScore: 0,
        subjectCount: 0,
      };
    }
    if (!acc[result.studentId].subjects[result.subjectId]) {
      acc[result.studentId].subjects[result.subjectId] = {
        name: result.subject.name,
        totalScore: 0,
        examCount: 0,
      };
    }
    acc[result.studentId].subjects[result.subjectId].totalScore += result.score;
    acc[result.studentId].subjects[result.subjectId].examCount++;
    return acc;
  }, {});

  // Calculate average scores and create ranking
  let ranking = Object.values(studentResults)
    .map((studentResult: any) => {
      let totalScore = 0;
      const subjectAverages = subjectIds.map(subjectId => {
        const subject = studentResult.subjects[subjectId];
        if (subject) {
          const averageScore = subject.totalScore / subject.examCount;
          totalScore += averageScore;
          return {
            name: subject.name,
            averageScore,
          };
        } else {
          totalScore += 0;
          return {
            name: 'Unknown Subject',
            averageScore: 0,
          };
        }
      });

      const overallAverage = totalScore / subjectIds.length;

      return {
        studentName: `${studentResult.student.firstName} ${studentResult.student.lastName}`,
        overallAverage,
        subjectAverages,
      };
    })
    .sort((a: any, b: any) => order === 'desc' ? b.overallAverage - a.overallAverage : a.overallAverage - b.overallAverage);

  // Apply search filter
  if (search) {
    ranking = ranking.filter((item: any) =>
      item.studentName.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Add rank to each item
  ranking = ranking.map((item: any, index: number) => ({
    ...item,
    rank: index + 1,
  }));

  return NextResponse.json({ ranking });
}