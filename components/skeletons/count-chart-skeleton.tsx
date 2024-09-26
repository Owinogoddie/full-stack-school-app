const CountSkeleton = () => {
    return (
      <div className="bg-white rounded-xl w-full h-full p-4 animate-pulse">
        <div className="flex justify-between items-center mb-4">
          <div className="h-4 bg-gray-300 rounded w-24"></div>
          <div className="h-4 bg-gray-300 rounded w-6"></div>
        </div>
        <div className="relative w-full h-[75%]">
          <div className="h-full w-full rounded-full bg-gray-200"></div>
        </div>
      </div>
    );
  };
  