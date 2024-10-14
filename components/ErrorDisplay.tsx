// app/components/ErrorDisplay.tsx
'use client'
import React from 'react';
import { useRouter } from 'next/navigation';

interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg shadow-md p-6 my-4 max-w-4xl mx-auto">
      <div className="flex items-center mb-4">
        <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h2 className="text-xl font-semibold text-red-700">Error Occurred</h2>
      </div>
      <p className="text-red-600 mb-4">{message}</p>
      <p className="text-sm text-gray-600 mb-4">This could be due to a network error or server issue.</p>
      <div className="flex justify-between items-center">
        <button
          onClick={handleRefresh}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105"
        >
          Refresh Page
        </button>
        <a href="/" className="text-red-500 hover:text-red-600 font-medium">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default ErrorDisplay;