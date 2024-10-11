import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

interface SubjectResult {
  name: string;
  totalScore: number;
  examCount: number;
}

interface StudentResult {
  student: any;
  subjects: Record<string, SubjectResult>;
  totalScore: number;
  subjectCount: number;
  exams: Set<number>;
}

interface Filters {
  academicYearId: string;
  examIds: string[];
  gradeId: string;
  classId: string;
  subjectIds: string[];
  search?: string;
}

export async function POST(request: NextRequest) {
  try {
    const filters: Filters = await request.json();
    console.log('Received filters:', filters);

    const { academicYearId, examIds, classId, subjectIds } = filters;
    let {gradeId}=filters

    if (!academicYearId || examIds.length === 0 || (!gradeId && !classId) || subjectIds.length === 0) {
      return NextResponse.json({ error: 'Missing required filters' }, { status: 400 });
    }

    // If classId is provided but gradeId is not, fetch the gradeId
    if (classId && !gradeId || gradeId === '') {
      const classData = await prisma.class.findUnique({
        where: { id: parseInt(classId) },
        select: { gradeId: true },
      });

      if (classData) {
        gradeId = classData.gradeId.toString();
      } else {
        return NextResponse.json({ error: 'Invalid classId' }, { status: 400 });
      }
    }

    const results = await prisma.result.findMany({
      where: {
        academicYearId: parseInt(academicYearId),
        examId: { in: examIds.map(Number) },
        subjectId: { in: subjectIds.map(Number) },
        gradeId: parseInt(gradeId),
        ...(classId ? { classId: parseInt(classId) } : {}),
      },
      include: {
        student: true,
        subject: true,
        exam: true,
      },
    });

    const studentResults: Record<string, StudentResult> = results.reduce((acc, result) => {
      const studentId = result.student.id;
      const subjectId = result.subject.id.toString();

      if (!acc[studentId]) {
        acc[studentId] = {
          student: result.student,
          subjects: {},
          totalScore: 0,
          subjectCount: 0,
          exams: new Set<number>(),
        };
      }

      if (!acc[studentId].subjects[subjectId]) {
        acc[studentId].subjects[subjectId] = {
          name: result.subject.name,
          totalScore: 0,
          examCount: 0,
        };
      }

      acc[studentId].subjects[subjectId].totalScore += result.score;
      acc[studentId].subjects[subjectId].examCount++;
      acc[studentId].totalScore += result.score;
      acc[studentId].subjectCount++;
      acc[studentId].exams.add(result.examId);

      return acc;
    }, {} as Record<string, StudentResult>);

    const finalResults = await Promise.all(Object.values(studentResults).map(async (studentResult) => {
      const overallAverage = studentResult.totalScore / studentResult.subjectCount;
      const subjectResults = Object.entries(studentResult.subjects).map(([subjectId, subject]) => ({
        subjectId: parseInt(subjectId),
        name: subject.name,
        averageScore: subject.totalScore / subject.examCount,
      }));

      const finalResult = await prisma.finalResult.upsert({
        where: {
          studentId_academicYearId: {
            studentId: studentResult.student.id,
            academicYearId: parseInt(academicYearId),
          },
        },
        update: {
          overallAverage,
          subjectResults: JSON.stringify(subjectResults),
          gradeId: parseInt(gradeId),
          classId: classId ? parseInt(classId) : undefined,
          examResults: {
            deleteMany: {},
            create: Array.from(studentResult.exams).map((examId) => ({ examId })),
          },
        },
        create: {
          student: { connect: { id: studentResult.student.id } },
          academicYear: { connect: { id: parseInt(academicYearId) } },
          grade: { connect: { id: parseInt(gradeId) } },
          ...(classId ? { class: { connect: { id: parseInt(classId) } } } : {}),
          overallAverage,
          subjectResults: JSON.stringify(subjectResults),
          examResults: {
            create: Array.from(studentResult.exams).map((examId) => ({ examId })),
          },
        },
      });

      return finalResult;
    }));
console.log(finalResults)
    return NextResponse.json({ message: `Saved ${finalResults.length} final results successfully.` });
  } catch (error) {
    console.error('Error saving final results:', error);
    return NextResponse.json({ error: 'An error occurred while saving final results.' }, { status: 500 });
  }
}