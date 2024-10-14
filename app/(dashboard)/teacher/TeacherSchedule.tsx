"use client";

import Announcements from "@/components/announcements";
import BigCalendarContainer from "@/components/calendars/big-calendar-container";
import { useSession } from "@clerk/nextjs";

const TeacherSchedule: React.FC = () => {
  const { session } = useSession();
  const userId = session?.user?.id;

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Schedule</h1>
          <BigCalendarContainer type="teacherId" id={userId!} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <Announcements />
      </div>
    </div>
  );
};

export default TeacherSchedule;
