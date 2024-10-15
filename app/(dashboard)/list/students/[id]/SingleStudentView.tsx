// SingleStudentView.tsx
'use client';

import React from 'react';
import Announcements from "@/components/announcements";
import BigCalendarContainer from "@/components/calendars/big-calendar-container";
import Performance from "@/components/charts/perfomance-chart";
import ClientOnlyComponent from "@/components/client-only-component";
import FormContainer from "@/components/form-container";
import StudentAttendanceCard from "@/components/student-attendance-card";
import { Class, Student, Grade, School, Parent, StudentCategory } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

type StudentWithRelations = Student & {
  class: (Class & { _count: { lessons: number } }) | null;
  grade: Grade;
  school: School | null;
  parent: Parent | null;
  studentCategories: StudentCategory[];
};

interface SingleStudentViewProps {
  student: StudentWithRelations;
  role: string | undefined;
}

const SingleStudentView: React.FC<SingleStudentViewProps> = ({ student, role }) => {
  return (
    <ClientOnlyComponent>
      <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
        {/* LEFT */}
        <div className="w-full xl:w-2/3">
          {/* TOP */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* USER INFO CARD */}
            <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
              <div className="w-1/3">
                <Image
                  src={student.img || "/noAvatar.png"}
                  alt=""
                  width={144}
                  height={144}
                  className="w-36 h-36 rounded-full object-cover"
                />
              </div>
              <div className="w-2/3 flex flex-col justify-between gap-4">
                <div className="flex items-center gap-4">
                  <h1 className="text-xl font-semibold">
                    {student.firstName + " " + student.lastName}
                  </h1>
                  {role === "admin" && (
                    <FormContainer table="student" type="update" data={student} />
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  UPI: {student.upi} | Admission Number: {student.admissionNumber || "N/A"}
                </p>
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                  <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                    <Image src="/gender.png" alt="" width={14} height={14} />
                    <span>{student.gender}</span>
                  </div>
                  <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                    <Image src="/date.png" alt="" width={14} height={14} />
                    <span>
                      {new Intl.DateTimeFormat("en-GB").format(student.dateOfBirth)}
                    </span>
                  </div>
                  <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                    <Image src="/mail.png" alt="" width={14} height={14} />
                    <span>{student.parent?.email || "N/A"}</span>
                  </div>
                  <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                    <Image src="/phone.png" alt="" width={14} height={14} />
                    <span>{student.parent?.phone || "N/A"}</span>
                  </div>
                </div>
                   {/* Student Categories */}
                   <div className="mt-2">
                  <h2 className="text-sm font-semibold">Categories:</h2>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {student.studentCategories.map((category) => (
                      <span key={category.id} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* SMALL CARDS */}
            <div className="flex-1 flex gap-4 justify-between flex-wrap">
              {/* Other small cards remain unchanged */}
              <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                <Image
                  src="/singleAttendance.png"
                  alt="attendance"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
                <StudentAttendanceCard id={student.id} />
              </div>
              {/* Other cards remain unchanged */}
            </div>
          </div>
          {/* BOTTOM */}
          <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
            <h1>Student&apos;s Schedule</h1>
            <BigCalendarContainer type="classId" id={student.classId?.toString() || ""} />
          </div>
        </div>
        {/* RIGHT */}
        <div className="w-full xl:w-1/3 flex flex-col gap-4">
          <div className="bg-white p-4 rounded-md">
            <h1 className="text-xl font-semibold">Shortcuts</h1>
            <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
              <Link
                className="p-3 rounded-md bg-lamaSkyLight"
                href={`/list/lessons?classId=${student.classId}`}
              >
                Student&apos;s Lessons
              </Link>
              <Link
                className="p-3 rounded-md bg-lamaPurpleLight"
                href={`/list/teachers?classId=${student.classId}`}
              >
                Student&apos;s Teachers
              </Link>
              <Link
                className="p-3 rounded-md bg-pink-50"
                href={`/list/exams?classId=${student.classId}`}
              >
                Student&apos;s Exams
              </Link>
              <Link
                className="p-3 rounded-md bg-lamaSkyLight"
                href={`/list/assignments?classId=${student.classId}`}
              >
                Student&apos;s Assignments
              </Link>
              <Link
                className="p-3 rounded-md bg-lamaYellowLight"
                href={`/list/results?studentId=${student.id}`}
              >
                Student&apos;s Results
              </Link>
            </div>
          </div>
          <Performance />
          <Announcements />
        </div>
      </div>
    </ClientOnlyComponent>
  );
};

export default SingleStudentView;