'use client'
import React, { useEffect, useState } from 'react';
import BigCalendar from './big-calendar';
import { adjustScheduleToCurrentWeek } from '@/lib/utils';
import moment from 'moment';
import { getLessons } from '@/actions/lesson-actions';

interface BigCalendarContainerProps {
  type: 'teacherId' | 'classId';
  id: string | number;
}

const BigCalendarContainer: React.FC<BigCalendarContainerProps> = ({ type, id }) => {
  const [schedule, setSchedule] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataRes = await getLessons(type, id);

        const adjustedData = dataRes.map((lesson: any) => ({
          title: lesson.title,
          start: moment.utc(lesson.start).subtract(3, 'hours').toDate(),
          end: moment.utc(lesson.end).subtract(3, 'hours').toDate(),
          day: lesson.day,
        }));

        const scheduleData = adjustScheduleToCurrentWeek(adjustedData);
        setSchedule(scheduleData);
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };

    fetchData();
  }, [type, id]);

  return (
    <div className="h-[600px]">
      <BigCalendar data={schedule} />
    </div>
  );
};

export default BigCalendarContainer;
