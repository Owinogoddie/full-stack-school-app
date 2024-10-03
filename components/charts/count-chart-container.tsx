import Image from "next/image";
import prisma from "@/lib/prisma";
import CountChart from "./count-chart";

const CountChartContainer = async () => {
  const data = await prisma.student.groupBy({
    by: ["gender"], // Group by gender
    _count: {
      _all: true, // Count all records
    },
  });

  // Initialize counts for boys and girls
  const boysCount = data.find((d) => d.gender === "MALE")?._count._all || 0; // Extract _all from _count
  const girlsCount = data.find((d) => d.gender === "FEMALE")?._count._all || 0; // Extract _all from _count

  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      {/* TITLE */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Students</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      {/* CHART */}
      <CountChart boys={boysCount} girls={girlsCount} />
      {/* BOTTOM */}
      <div className="flex justify-center gap-16">
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-lamaSky rounded-full" />
          <h1 className="font-bold">{boysCount}</h1>
          <h2 className="text-xs text-gray-300">
            Boys ({Math.round((boysCount / (boysCount + girlsCount)) * 100)}%)
          </h2>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-lamaYellow rounded-full" />
          <h1 className="font-bold">{girlsCount}</h1>
          <h2 className="text-xs text-gray-300">
            Girls ({Math.round((girlsCount / (boysCount + girlsCount)) * 100)}%)
          </h2>
        </div>
      </div>
    </div>
  );
};

export default CountChartContainer;
