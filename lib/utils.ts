// IT APPEARS THAT BIG CALENDAR SHOWS THE LAST WEEK WHEN THE CURRENT DAY IS A WEEKEND.
// FOR THIS REASON WE'LL GET THE LAST WEEK AS THE REFERENCE WEEK.
// IN THE TUTORIAL WE'RE TAKING THE NEXT WEEK AS THE REFERENCE WEEK.

import moment from 'moment-timezone';

// Get the latest Monday
const getLatestMonday = (): moment.Moment => {
  const today = moment().tz("Africa/Nairobi");
  const dayOfWeek = today.day();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return today.subtract(daysSinceMonday, 'days').startOf('day');
};

// Adjust schedule to current week
export const adjustScheduleToCurrentWeek = (
  lessons: { title: string; start: Date; end: Date; day: string }[]
): { title: string; start: Date; end: Date }[] => {
  const latestMonday = getLatestMonday();

  return lessons.map((lesson) => {
    const lessonStart = moment(lesson.start).tz("Africa/Nairobi");
    const lessonEnd = moment(lesson.end).tz("Africa/Nairobi");

    // Map day string to number (0 for Sunday, 1 for Monday, etc.)
    const dayMap: { [key: string]: number } = {
      'SUNDAY': 0, 'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3,
      'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6
    };
    const daysFromMonday = dayMap[lesson.day];

    const adjustedStartDate = latestMonday.clone().add(daysFromMonday, 'days')
      .hour(lessonStart.hour())
      .minute(lessonStart.minute())
      .second(lessonStart.second());

    const adjustedEndDate = adjustedStartDate.clone()
      .add(lessonEnd.diff(lessonStart));

    return {
      title: lesson.title,
      start: adjustedStartDate.toDate(),
      end: adjustedEndDate.toDate(),
    };
  });
};

// Format time to local
export const formatTimeToLocal = (time: Date): string => {
  return moment(time).tz("Africa/Nairobi").format('YYYY-MM-DDTHH:mm:ss.SSS');
};

// Get lessons (commented out as in your original code)
// export const getLessons = async () => {
//   const lessons = await prisma.lesson.findMany({
//     include: {
//       subject: true,
//       class: true,
//       teacher: true,
//     },
//   });
//
//   return lessons.map(lesson => ({
//     ...lesson,
//     startTime: formatTimeToLocal(lesson.startTime),
//     endTime: formatTimeToLocal(lesson.endTime),
//   }));
// };
  

  // export const getLessons = async () => {
  //   const lessons = await prisma.lesson.findMany({
  //     include: {
  //       subject: true,
  //       class: true,
  //       teacher: true,
  //     },
  //   });
  
  //   return lessons.map(lesson => ({
  //     ...lesson,
  //     startTime: formatTimeToLocal(lesson.startTime),
  //     endTime: formatTimeToLocal(lesson.endTime),
  //   }));
  // };