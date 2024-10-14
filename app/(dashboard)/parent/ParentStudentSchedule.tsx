// ParentStudentSchedule.tsx
'use client';

import React from 'react';
import Announcements from '@/components/announcements';
import BigCalendarContainer from '@/components/calendars/big-calendar-container';
import { Student } from '@prisma/client';

interface ParentStudentScheduleProps {
  students: (Student & { class: { id: string | number } | null })[];
}

const ParentStudentSchedule: React.FC<ParentStudentScheduleProps> = ({ students }) => {
  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="">
        {students.map((student) => (
          <div className="w-full xl:w-2/3" key={student.id}>
            <div className="h-full bg-white p-4 rounded-md">
              <h1 className="text-xl font-semibold">
                Schedule ({student.firstName + ' ' + student.lastName})
              </h1>
              {student.class && (
                <BigCalendarContainer type="classId" id={student.class.id.toString()} />
              )}
            </div>
          </div>
        ))}
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <Announcements />
      </div>
    </div>
  );
};

export default ParentStudentSchedule;
