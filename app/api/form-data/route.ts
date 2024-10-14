import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get('table');
  const type = searchParams.get('type');

  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  let relatedData = {};

  if (type !== "delete") {
    switch (table) {
      case "academicYear":
        // const academicYearSchools = await prisma.school.findMany({
        //   select: { id: true, name: true },
        // });
        // relatedData = { schools: academicYearSchools };
        break;
      case "department":
        const departmentTeachers = await prisma.teacher.findMany({
          select: { id: true, firstName: true, lastName: true }, // Updated field names
        });
        relatedData = { teachers: departmentTeachers };
        break;
      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, firstName: true, lastName: true }, // Updated field names
        });
        const allSubjects= await prisma.subject.findMany({
          include: {
            parent: true,
            children: true,
            relatedTo: true,
          }
        });
        relatedData = { teachers: subjectTeachers,allSubjects };
        break;

      case "class":
        const classGrades = await prisma.grade.findMany({
          select: { id: true, levelName: true }, // Updated field names
        });
        const classTeachers = await prisma.teacher.findMany({
          select: { id: true, firstName: true, lastName: true }, // Updated field names
        });
        relatedData = { teachers: classTeachers, grades: classGrades };
        break;

      case "grade":
        const gradeSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        relatedData = { subjects: gradeSubjects };
        break;

      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        const departments = await prisma.department.findMany({
          select: { id: true, name: true },
        });
        relatedData = { subjects: teacherSubjects, departments };
        break;

      case "student":
        const studentGrades = await prisma.grade.findMany({
          select: { id: true, levelName: true }, // Updated field names
        });
        const clases = await prisma.class.findMany();
        const academicYears = await prisma.academicYear.findMany();
        const studentParents = await prisma.parent.findMany({
          // Updated variable name
          select: {
            id: true,
            firstName: true,
            lastName: true, // Updated field names
          },
        });
        relatedData = {
          classes: clases,
          grades: studentGrades,
          parents: studentParents,
          academicYears,
        };
        break;

      case "parent":
        const parentStudents = await prisma.student.findMany({
          select: { id: true, firstName: true, lastName: true }, // Updated field names
        });
        relatedData = { students: parentStudents };
        break;

      case "lesson":
        const lessonSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        const lessonClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        const lessonTeachers = await prisma.teacher.findMany({
          select: { id: true, firstName: true, lastName: true }, // Updated field names
        });
        relatedData = {
          subjects: lessonSubjects,
          classes: lessonClasses,
          teachers: lessonTeachers,
        };
        break;

      case "assignment":
        const assignmentLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: { id: true, name: true },
        });
        relatedData = { lessons: assignmentLessons };
        break;

      case "result":
        const resultStudents = await prisma.student.findMany({
          select: { id: true, firstName: true, lastName: true },
        });

        const resultSubjects = await prisma.subject.findMany({
          select: { id: true, name: true }, // Adjust field names if necessary
        });

        const resultAcademicYears = await prisma.academicYear.findMany({
          select: { id: true, year: true }, // Adjust field names if necessary
        });

        const resultGrades = await prisma.grade.findMany({
          select: { id: true, levelName: true }, // Adjust field names if necessary
        });
        const resultGradescales = await prisma.gradeScale.findMany({
          select: { id: true, name: true }, // Adjust field names if necessary
        });
        const resultExams = await prisma.exam.findMany({
          select: { id: true, title: true }, // Adjust field names if necessary
        });

        const resultClases = await prisma.class.findMany({
          select: { id: true, name: true }, // Adjust field names if necessary
        });

        relatedData = {
          students: resultStudents,
          subjects: resultSubjects,
          academicYears: resultAcademicYears,
          grades: resultGrades,
          classes:resultClases,
          gradeScales:resultGradescales,
          exams:resultExams,
        };
        break;

      case "attendance":
        const attendanceStudents = await prisma.student.findMany({
          select: { id: true, firstName: true, lastName: true }, // Updated field names
        });
        const attendanceLessons = await prisma.lesson.findMany({
          select: { id: true, name: true },
        });
        relatedData = {
          students: attendanceStudents,
          lessons: attendanceLessons,
        };
        break;

      case "event":
        const eventClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        relatedData = { classes: eventClasses };
        break;

      case "announcement":
        const announcementClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        relatedData = { classes: announcementClasses };
        break;

      case "exam":
        const examLessons = await prisma.lesson.findMany({
          select: { id: true, name: true },
        });
        const examSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        const examGrades = await prisma.grade.findMany({
          select: { id: true, levelName: true },
        });
        const examAcademicYears = await prisma.academicYear.findMany({
          select: { id: true, year: true },
        });
        relatedData = {
          lessons: examLessons,
          subjects: examSubjects,
          grades: examGrades,
          academicYears: examAcademicYears,
        };
        break;
      case "gradeScale":
        const gradeScaleSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        relatedData = { subjects: gradeScaleSubjects };
        break;
      case "examSchedule":
        const examScheduleExams = await prisma.exam.findMany({
          select: { id: true, title: true },
        });
        const examScheduleSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        relatedData = {
          exams: examScheduleExams,
          subjects: examScheduleSubjects,
        };
        break;

      // Add additional cases for other table types if necessary.
      default:
        throw new Error(`Unknown table type: ${table}`);
    }
  }


  return NextResponse.json(relatedData);
}