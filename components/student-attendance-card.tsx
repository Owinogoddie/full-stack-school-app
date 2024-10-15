"use client";

import { useEffect, useState } from "react";
import { getStudentAttendance } from "@/actions/attendance-actions";

interface StudentAttendanceCardProps {
  id: string;
}

const StudentAttendanceCard: React.FC<StudentAttendanceCardProps> = ({ id }) => {
  const [attendanceData, setAttendanceData] = useState<{ percentage: string }>({
    percentage: "-",
  });

  useEffect(() => {
    const fetchAttendance = async () => {
      const data = await getStudentAttendance(id);
      setAttendanceData({ percentage: data.percentage });
    };

    fetchAttendance();
  }, [id]);

  return (
    <div className="">
      <h1 className="text-xl font-semibold">{attendanceData.percentage}%</h1>
      <span className="text-sm text-gray-400">Attendance</span>
    </div>
  );
};

export default StudentAttendanceCard;
