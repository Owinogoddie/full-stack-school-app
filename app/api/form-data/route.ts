import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");
  const type = searchParams.get("type");

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
        const allSubjects = await prisma.subject.findMany({
          include: {
            parent: true,
            children: true,
            relatedTo: true,
          },
        });
        relatedData = { teachers: subjectTeachers, allSubjects };
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
        const studentCategories = await prisma.studentCategory.findMany();
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
          studentCategories,
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
          classes: resultClases,
          gradeScales: resultGradescales,
          exams: resultExams,
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

      case "studentCategory":
        // No related data needed for student category
        break;

      case "feeType":
      // No related data needed for fee type
      case "feeTransaction":
        // No related data needed for fee type
        break;
      case "specialProgramme":
        const specialProgrammeGrades = await prisma.grade.findMany({
          select: { id: true, levelName: true },
        });
        
        const specialProgrammeClasses = await prisma.class.findMany({
          select: { id: true, name: true, gradeId: true },
        });
        
        const specialProgrammeStudents = await prisma.student.findMany({
          select: { id: true, firstName: true, lastName: true, classId: true },
        });
        
        relatedData = {
          grades: specialProgrammeGrades,
          classes: specialProgrammeClasses,
          students: specialProgrammeStudents,
        };
        
        // console.log({relatedData})

        break;
      case "feeTemplate":
        const feeTemplateGrades = await prisma.grade.findMany({
          select: { id: true, levelName: true },
        });
        const feeTemplateClasses = await prisma.class.findMany({
          select: { id: true, name: true, gradeId: true },
        });
        const feeTemplateAcademicYears = await prisma.academicYear.findMany({
          select: { id: true, year: true },
        });
        const feeTemplateTerms = await prisma.term.findMany({
          select: { id: true, name: true, academicYearId: true }, 
        });
        const feeTemplateTypes = await prisma.feeType.findMany({
          select: { id: true, name: true, amount: true },
        });
        const feeTemplateCategories = await prisma.studentCategory.findMany({
          select: { id: true, name: true },
        });
        const feeTemplateProgrammes = await prisma.specialProgramme.findMany({
          select: { id: true, name: true,grades:true,classes:true },
        });
        relatedData = {
          grades: feeTemplateGrades,
          classes: feeTemplateClasses,
          academicYears: feeTemplateAcademicYears,
          terms: feeTemplateTerms,
          feeTypes: feeTemplateTypes,
          studentCategories: feeTemplateCategories,
          specialProgrammes:feeTemplateProgrammes
        };
        break;
      case "fee":
        const feeTemplateGradess = await prisma.grade.findMany({
          select: { id: true, levelName: true },
        });
        const feeTemplateClassess = await prisma.class.findMany({
          select: { id: true, name: true, gradeId: true },
        });
        const feeTemplateAcademicYearss = await prisma.academicYear.findMany({
          select: { id: true, year: true },
        });
        const feeTemplateTermss = await prisma.term.findMany({
          select: { id: true, name: true, academicYearId: true }, 
        });
        // const feeTemplateTypess = await prisma.feeType.findMany({
        //   select: { id: true, name: true, amount: true },
        // });
        const feeTemplateCategoriess = await prisma.studentCategory.findMany({
          select: { id: true, name: true },
        });
        const feeTemplateProgrammess = await prisma.specialProgramme.findMany({
          select: { id: true, name: true,grades:true,classes:true },
        });
        const feetemplates = await prisma.feeTemplate.findMany({
          select: {
            id: true,
            feeType: {
              select: { name: true },
            },
            academicYear: {
              select: { year: true },
            },
            term: {
              select: { name: true },
            },
            baseAmount:true,
          },
        });
        const formatedfeetemplates = feetemplates.map((template) => ({
          id: template.id,
          name: `${template.feeType.name} - ${template.academicYear.year} - ${template.term.name}`,
          baseAmount:template.baseAmount
        }));
        relatedData = {
          grades: feeTemplateGradess,
          classes: feeTemplateClassess,
          academicYears: feeTemplateAcademicYearss,
          terms: feeTemplateTermss,
          // feeTypes: feeTemplateTypess,
          studentCategories: feeTemplateCategoriess,
          specialProgrammes:feeTemplateProgrammess,
          feeTemplates:formatedfeetemplates
        };
        break;
      case "feeException":
        const feeExceptionStudents = await prisma.student.findMany({
          select: { id: true, firstName: true, lastName: true },
        });
        const feeExceptionTemplates = await prisma.feeTemplate.findMany({
          select: {
            id: true,
            feeType: {
              select: { name: true },
            },
            academicYear: {
              select: { year: true },
            },
            term: {
              select: { name: true },
            },
          },
        });
        const formattedFeeTemplates = feeExceptionTemplates.map((template) => ({
          id: template.id,
          name: `${template.feeType.name} - ${template.academicYear.year} - ${template.term.name}`,
        }));
        const feeExceptionAcademicYears = await prisma.academicYear.findMany({
          select: { id: true, year: true },
        });
        const feeExceptionTerms = await prisma.term.findMany({
          select: { id: true, name: true, academicYearId: true },
        });
        const feeExceptionTypes = await prisma.feeType.findMany({
          select: { id: true, name: true },
        });
        relatedData = {
          students: feeExceptionStudents,
          feeTemplates: formattedFeeTemplates,
          academicYears: feeExceptionAcademicYears,
          terms: feeExceptionTerms,
          feeTypes:feeExceptionTypes
        };
        break;
      case "term":
        const termAcademicYears = await prisma.academicYear.findMany({
          select: { id: true, year: true },
        });
        // console.log(termAcademicYears)
        relatedData = {
          academicYears: termAcademicYears,
        };
        break;

      // Add additional cases for other table types if necessary.
      default:
        throw new Error(`Unknown table type: ${table}`);
    }
  }

  return NextResponse.json(relatedData);
}
