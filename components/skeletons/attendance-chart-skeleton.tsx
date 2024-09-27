export const AttendanceSkeleton = () => {
    return (
      <div className="bg-white rounded-lg p-4 h-full animate-pulse">
        <div className="flex justify-between items-center mb-4">
          <div className="h-4 bg-gray-300 rounded w-24"></div>
          <div className="h-4 bg-gray-300 rounded w-6"></div>
        </div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  };
  