import React from 'react';
import prisma from "@/lib/prisma";
import BigCalendar from "./big-calendar";
import { adjustScheduleToCurrentWeek } from "@/lib/utils";
import moment from 'moment';

interface BigCalendarContainerProps {
  type: "teacherId" | "classId";
  id: string | number;
}

const BigCalendarContainer: React.FC<BigCalendarContainerProps> = async ({ type, id }) => {
  // Fetch data from the database
  const dataRes = await prisma.lesson.findMany({
    where: {
      ...(type === "teacherId"
        ? { teacherId: id as string }
        : { classId: parseInt(id as string, 10) }),
    },
  });

  // console.log("Raw data from database:", dataRes);

  // Map the data and manually adjust times by subtracting 3 hours from UTC
  const data = dataRes.map((lesson) => ({
    title: lesson.name,
    start: moment.utc(lesson.startTime).subtract(3, 'hours').toDate(), // Subtract 3 hours from UTC
    end: moment.utc(lesson.endTime).subtract(3, 'hours').toDate(),    // Subtract 3 hours from UTC
    day: lesson.day,
  }));

  // console.log("Data after manual time adjustment:", data);

  // Adjust the schedule to align with the current week
  const schedule = adjustScheduleToCurrentWeek(data);

  // console.log("Schedule after adjustment:", schedule);

  return (
    <div className="h-[600px]">
      <BigCalendar data={schedule} />
    </div>
  );
};

export default BigCalendarContainer;
