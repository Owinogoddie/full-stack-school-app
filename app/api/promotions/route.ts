import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const academicYearId = searchParams.get('academicYearId');
    const gradeId = searchParams.get('gradeId');
    const classId = searchParams.get('classId');
    const examIds = searchParams.getAll('examIds[]');
    const search = searchParams.get('search') || '';
  
    if (!academicYearId) {
      return NextResponse.json({ error: 'Missing required parameter: academicYearId' }, { status: 400 });
    }
  
    try {
      const whereClause: any = {
        academicYearId: parseInt(academicYearId),
        student: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        },
      };
  
      if (gradeId) whereClause.gradeId = parseInt(gradeId);
      if (classId) whereClause.classId = parseInt(classId);
      if (examIds.length > 0) {
        whereClause.examResults = {
          some: {
            examId: { in: examIds.map(Number) }
          }
        };
      }
  
      const finalResults = await prisma.finalResult.findMany({
        where: whereClause,
        include: {
          student: {
            include: {
              enrollments: {
                where: { academicYearId: parseInt(academicYearId) },
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
          grade: true,
          class: true,
          examResults: {
            include: { exam: true },
          },
        },
        orderBy: {
          overallAverage: 'desc',
        },
      });
  
      const students = finalResults.map((result, index) => ({
        id: result.studentId,
        firstName: result.student.firstName,
        lastName: result.student.lastName,
        grade: result.grade,
        class: result.class,
        overallAverage: result.overallAverage,
        subjectResults: JSON.parse(result.subjectResults as string),
        examResults: result.examResults,
        rank: index + 1,
        promotionStatus: result.student.enrollments[0]?.status || 'PENDING',
        promoted: result.promoted,
      }));
  
      return NextResponse.json({ students });
    } catch (error) {
      console.error('Error fetching students:', error);
      return NextResponse.json({ error: 'Error fetching students' }, { status: 500 });
    }
  }
export async function POST(request: NextRequest) {
    try {
      const { 
        academicYearId, 
        newAcademicYearId, 
        // gradeId, 
        newGradeId, 
        // classId, 
        newClassId, 
        studentIds,
        promotionStatus
      } = await request.json();
  
      if (!academicYearId || !newAcademicYearId || !newGradeId || !studentIds || studentIds.length === 0) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
      }
  
      if (academicYearId === newAcademicYearId) {
        return NextResponse.json({ error: 'New academic year must be different from the current one' }, { status: 400 });
      }
  
      const updatedStudents = await prisma.$transaction(async (tx) => {
        return Promise.all(studentIds.map(async (studentId: string) => {
          // Update the current enrollment
          await tx.enrollment.updateMany({
            where: {
              studentId: studentId,
              academicYearId: parseInt(academicYearId),
              status: 'ACTIVE',
            },
            data: {
              status: promotionStatus === 'PROMOTED' ? 'COMPLETED' : 'REPEATED',
            },
          });
  
          // Create a new enrollment
          const newEnrollment = await tx.enrollment.create({
            data: {
              studentId: studentId,
              academicYearId: parseInt(newAcademicYearId),
              gradeId: parseInt(newGradeId),
              classId: newClassId ? parseInt(newClassId) : undefined,
              status: 'ACTIVE',
            },
          });
  
          // Update the student's current academic year, grade, and class
          const updatedStudent = await tx.student.update({
            where: { id: studentId },
            data: {
              currentAcademicYearId: parseInt(newAcademicYearId),
              gradeId: parseInt(newGradeId),
              classId: newClassId ? parseInt(newClassId) : null,
            },
            include: {
              grade: true,
              class: true,
            },
          });
  
          // Update the final result
          const finalResult = await tx.finalResult.update({
            where: { 
              studentId_academicYearId: {
                studentId: studentId,
                academicYearId: parseInt(academicYearId)
              }
            },
            data: {
              promoted: promotionStatus === 'PROMOTED',
            },
          });
  
          return {
            firstName: updatedStudent.firstName,
            lastName: updatedStudent.lastName,
            grade: updatedStudent.grade,
            class: updatedStudent.class,
            promotionStatus: newEnrollment.status,
            promoted: finalResult.promoted,
          };
        }));
      });
  
      return NextResponse.json({ message: 'Students updated successfully', updatedStudents });
    } catch (error) {
      console.error('Error updating students:', error);
      return NextResponse.json({ error: 'Error updating students' }, { status: 500 });
    }
  }