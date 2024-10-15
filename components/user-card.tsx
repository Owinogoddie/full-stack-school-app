// UserCard.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getUserCount } from "@/actions/user-actions";

type UserType = "admin" | "teacher" | "student" | "parent";

const UserCard: React.FC<{ type: UserType }> = ({ type }) => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const fetchUserCount = async () => {
      const userCount = await getUserCount(type);
      setCount(userCount);
    };

    fetchUserCount();
  }, [type]);

  return (
    <div className="rounded-2xl odd:bg-lamaPurple even:bg-lamaYellow p-4 flex-1 min-w-[130px]">
      <div className="flex justify-between items-center">
        <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600">
          2024/25
        </span>
        <Image src="/more.png" alt="" width={20} height={20} />
      </div>
      <h1 className="text-2xl font-semibold my-4">{count}</h1>
      <h2 className="capitalize text-sm font-medium text-gray-500">{type}s</h2>
    </div>
  );
};

export default UserCard;
