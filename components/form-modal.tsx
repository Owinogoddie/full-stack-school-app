"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import toast from "react-hot-toast";
import { FormContainerProps } from "./form-container";
import { deleteSubject } from "@/actions/subject-actions";
import { deleteClass } from "@/actions/class-actions";
import { deleteTeacher } from "@/actions/teacher-actions";
import { deleteStudent } from "@/actions/student-actions";
import { deleteExam } from "@/actions/exams-actions";
import { deleteParent } from "@/actions/parent-actions";
import { deleteLesson } from "@/actions/lesson-actions";
import { deleteAssignment } from "@/actions/assignment-actions";
import { deleteResult } from "@/actions/result-actions";
import { deleteAttendance } from "@/actions/attendance-actions";
import { deleteEvent } from "@/actions/event-actions";
import { deleteAnnouncement } from "@/actions/announcement-actions";
import { deleteGrade } from "@/actions/grade-actions";
import { deleteAcademicYear } from "@/actions/academic-year-actions";
import { deleteDepartment } from "@/actions/department-actions";
import { deleteGradeScale } from "@/actions/grade-scale-actions";
import { deleteExamSchedule } from "@/actions/exam-schedule";
import { deleteStudentCategory } from "@/actions/student-category-actions";
import { deleteFeeType } from "@/actions/fee-type-actions";
import { deleteTerm } from "@/actions/term-actions";
import { deleteFeeTemplate } from "@/actions/feetemplate-actions";

const deleteActionMap = {
  subject: deleteSubject,
  class: deleteClass,
  teacher: deleteTeacher,
  student: deleteStudent,
  parent: deleteParent,
  exam: deleteExam,
  lesson: deleteLesson,
  assignment: deleteAssignment,
  result: deleteResult,
  attendance: deleteAttendance,
  event: deleteEvent,
  announcement: deleteAnnouncement,
  grade: deleteGrade,
  academicYear: deleteAcademicYear,
  department: deleteDepartment,
  gradeScale:deleteGradeScale,
  examSchedule:deleteExamSchedule,
  studentCategory:deleteStudentCategory,
  feeType:deleteFeeType,
  term:deleteTerm,
  feeTemplate:deleteFeeTemplate

};

// USE LAZY LOADING
// studentCategory
// feeType
// term
// feeTemplate
// import TeacherForm from "./forms/TeacherForm";
// import StudentForm from "./forms/StudentForm";

const TeacherForm = dynamic(() => import("./forms/teacher-form"), {
  loading: () => <h1>Loading...</h1>,
});
const AcademicYearForm = dynamic(() => import("./forms/academic-year-form"), {
  loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("./forms/student-form"), {
  loading: () => <h1>Loading...</h1>,
});
const ParentForm = dynamic(() => import("./forms/parent-form"), {
  loading: () => <h1>Loading...</h1>,
});
const SubjectForm = dynamic(() => import("./forms/subject-form"), {
  loading: () => <h1>Loading...</h1>,
});
const ClassForm = dynamic(() => import("./forms/class-form"), {
  loading: () => <h1>Loading...</h1>,
});
const GradeForm = dynamic(() => import("./forms/grade-form"), {
  loading: () => <h1>Loading...</h1>,
});
const LessonForm = dynamic(() => import("./forms/lesson-form"), {
  loading: () => <h1>Loading...</h1>,
});
const AssignmentForm = dynamic(() => import("./forms/assignment-form"), {
  loading: () => <h1>Loading...</h1>,
});
const ResultForm = dynamic(() => import("./forms/result-form"), {
  loading: () => <h1>Loading...</h1>,
});
const AttendanceForm = dynamic(() => import("./forms/attendance-form"), {
  loading: () => <h1>Loading...</h1>,
});
const EventForm = dynamic(() => import("./forms/event-form"), {
  loading: () => <h1>Loading...</h1>,
});
const AnnouncementForm = dynamic(() => import("./forms/announcement-form"), {
  loading: () => <h1>Loading...</h1>,
});
const ExamForm = dynamic(() => import("./forms/exam-form"), {
  loading: () => <h1>Loading...</h1>,
});
const DepartmentForm = dynamic(() => import("./forms/department-form"), {
  loading: () => <h1>Loading...</h1>,
});
const GradeScaleForm = dynamic(() => import("./forms/grade-scale-form"), {
  loading: () => <h1>Loading...</h1>,
});
const ExamScheduleForm = dynamic(() => import("./forms/exam-schedule-form"), {
  loading: () => <h1>Loading...</h1>,
});
const TermForm = dynamic(() => import("./forms/term-form"), {
  loading: () => <h1>Loading...</h1>,
});
const FeeTemplateForm = dynamic(() => import("./forms/fee-template-form"), {
  loading: () => <h1>Loading...</h1>,
});
const FeeTypeForm = dynamic(() => import("./forms/fee-type-form"), {
  loading: () => <h1>Loading...</h1>,
});
const StudedntCategoryForm = dynamic(() => import("./forms/student-category-form"), {
  loading: () => <h1>Loading...</h1>,
});

const forms: {
  [key: string]: (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update",
    data?: any,
    relatedData?: any
  ) => JSX.Element;
} = {
  subject: (setOpen, type, data, relatedData) => (
    <SubjectForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  academicYear: (setOpen, type, data) => (
    <AcademicYearForm
      type={type}
      data={data}
      setOpen={setOpen}
    />
  ),
  class: (setOpen, type, data, relatedData) => (
    <ClassForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  grade: (setOpen, type, data) => (
    <GradeForm type={type} data={data} setOpen={setOpen} />
  ),
  teacher: (setOpen, type, data, relatedData) => (
    <TeacherForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  student: (setOpen, type, data, relatedData) => (
    <StudentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  parent: (setOpen, type, data) => (
    <ParentForm type={type} data={data} setOpen={setOpen} />
  ),
  exam: (setOpen, type, data, relatedData) => (
    <ExamForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  lesson: (setOpen, type, data, relatedData) => (
    <LessonForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  assignment: (setOpen, type, data, relatedData) => (
    <AssignmentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  result: (setOpen, type, data, relatedData) => (
    <ResultForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  attendance: (setOpen, type, data, relatedData) => (
    <AttendanceForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  event: (setOpen, type, data, relatedData) => (
    <EventForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  announcement: (setOpen, type, data, relatedData) => (
    <AnnouncementForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),

  department: (setOpen, type, data,relatedData) => (
    <DepartmentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  gradeScale: (setOpen, type, data,relatedData) => (
    <GradeScaleForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  examSchedule: (setOpen, type, data,relatedData) => (
    <ExamScheduleForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  term: (setOpen, type, data,relatedData) => (
    <TermForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />),
  studentCategory: (setOpen, type, data) => (
    <StudedntCategoryForm
      type={type}
      data={data}
      setOpen={setOpen}
    />
  ),
    
  feeType: (setOpen, type, data) => (
    <FeeTypeForm
      type={type}
      data={data}
      setOpen={setOpen}
    />),
    feeTemplate: (setOpen, type, data,relatedData) => (
    <FeeTemplateForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
};

const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
}: FormContainerProps & { relatedData?: any }) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaSky"
      : "bg-lamaPurple";

  const [open, setOpen] = useState(false);

  const Form = () => {
    const [state, formAction] = useFormState(deleteActionMap[table], {
      success: false,
      error: false,
    });

    const router = useRouter();

    useEffect(() => {
      if (state.success) {
        toast.success(`${table} has been deleted!`);
        setOpen(false);
        router.refresh();
      }
    }, [state, router]);

    return type === "delete" && id ? (
      <form action={formAction} className="p-4 flex flex-col gap-4">
        <input type="text | number" name="id" value={id} hidden />
        <span className="text-center font-medium">
          All data will be lost. Are you sure you want to delete this {table}?
        </span>
        <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center">
          Delete
        </button>
      </form>
    ) : type === "create" || type === "update" ? (
      forms[table](setOpen, type, data, relatedData)
    ) : (
      "Form not found!"
    );
  };

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
        onClick={() => setOpen(true)}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] max-h-[90vh] overflow-y-auto">
            <Form />
            <div
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <Image src="/close.png" alt="" width={14} height={14} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
