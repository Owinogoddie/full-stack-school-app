import prisma from "@/lib/prisma";
import FormModal from "./form-modal";
import { auth } from "@clerk/nextjs/server";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "grade"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement"
    | "department"
    | "academicYear";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};

  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

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
        relatedData = { teachers: subjectTeachers };
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
        relatedData = { subjects: teacherSubjects ,departments};
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
          academicYears
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
          select: { id: true, firstName: true, lastName: true }, // Updated field names
        });
        // const resultExams = await prisma.exam.findMany({
        //   select: { id: true, title: true },
        // });
        // const resultAssignments = await prisma.assignment.findMany({
        //   select: { id: true, title: true },
        // });
        relatedData = {
          students: resultStudents,
          // exams: resultExams,
          // assignments: resultAssignments,
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
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: { id: true, name: true },
        });
        relatedData = { lessons: examLessons };
        break;

      // Add additional cases for other table types if necessary.
      default:
        throw new Error(`Unknown table type: ${table}`);
    }
  }

  return (
    <FormModal
      table={table}
      type={type}
      relatedData={relatedData}
      data={data}
      id={id}
    />
  );
};

export default FormContainer;
