const PerformanceSkeleton = () => {
    return (
      <div className="bg-white p-4 rounded-md h-80 relative animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-gray-300 rounded w-24"></div>
          <div className="h-4 bg-gray-300 rounded w-6"></div>
        </div>
        <div className="h-48 w-48 rounded-full bg-gray-200 mx-auto"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="h-6 bg-gray-300 rounded w-12 mx-auto mb-1"></div>
          <div className="h-4 bg-gray-300 rounded w-16 mx-auto"></div>
        </div>
      </div>
    );
  };
  