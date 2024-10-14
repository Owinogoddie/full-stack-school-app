"use client";

import Announcements from "@/components/announcements";
import BigCalendarContainer from "@/components/calendars/big-calendar-container";
import EventCalendar from "@/components/calendars/event-calendar";
import { Class } from "@prisma/client";

interface StudentScheduleProps {
  classItem: Class[];
}

const StudentSchedule: React.FC<StudentScheduleProps> = ({ classItem }) => {
  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Schedule (4A)</h1>
          <BigCalendarContainer type="classId" id={classItem[0].id} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Announcements />
      </div>
    </div>
  );
};

export default StudentSchedule;
