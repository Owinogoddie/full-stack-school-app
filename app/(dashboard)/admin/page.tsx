import Announcements from "@/components/announcements";
import EventCalendar from "@/components/calendars/event-calendar";
import { AttendanceSkeleton } from "@/components/skeletons/attendance-chart-skeleton";
import { CountSkeleton } from "@/components/skeletons/count-chart-skeleton";
import { FinanceSkeleton } from "@/components/skeletons/finance-chart-skeleton";
import UserCard from "@/components/user-card";
import dynamic from "next/dynamic";

const AttendanceChart = dynamic(() => import('@/components/charts/attendance-chart'), {
  loading: () => <AttendanceSkeleton />,
});

const FinanceChart = dynamic(() => import('@/components/charts/finance-chart'), {
  loading: () => <FinanceSkeleton />,
});
const CountChart = dynamic(() => import('@/components/charts/count-chart'), {
  loading: () => <CountSkeleton />,
});

const AdminPage = () => {
  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* USER CARDS */}
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="student" />
          <UserCard type="teacher" />
          <UserCard type="parent" />
          <UserCard type="staff" />
        </div>
        {/* MIDDLE CHARTS */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* COUNT CHART */}
          <div className="w-full lg:w-1/3 h-[450px]">
            <CountChart />
          </div>
          {/* ATTENDANCE CHART */}
          <div className="w-full lg:w-2/3 h-[450px]">
            <AttendanceChart />
          </div>
        </div>
        {/* BOTTOM CHART */}
        <div className="w-full h-[500px]">
          <FinanceChart />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Announcements/>
      </div>
    </div>
  );
};

export default AdminPage;