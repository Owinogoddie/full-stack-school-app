// components/GlobalDataCheck.tsx
"use client";

import React, { useState } from 'react';
import CustomModal from './custom-modal';

interface RelatedData {
  lessons: any[];
  subjects: any[];
  grades: any[];
  academicYears: any[];
}

interface GlobalDataCheckProps {
  relatedData: RelatedData;
  children: React.ReactNode;
}

const GlobalDataCheck: React.FC<GlobalDataCheckProps> = ({ relatedData, children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [missingData, setMissingData] = useState<string[]>([]);

  React.useEffect(() => {
    const missingFields = Object.entries(relatedData)
      .filter(([, value]) => !value || value.length === 0)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      setMissingData(missingFields);
      setIsModalOpen(true);
    }
  }, [relatedData]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {children}
      <CustomModal isOpen={isModalOpen} onClose={handleCloseModal} title="Missing Data">
        <div>
          <p>The following data is required before proceeding:</p>
          <ul className="list-disc list-inside mt-2">
            {missingData.map((field) => (
              <li key={field} className="capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</li>
            ))}
          </ul>
          <p className="mt-4">Please enter the missing data before continuing.</p>
          <button
            onClick={handleCloseModal}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Okay
          </button>
        </div>
      </CustomModal>
    </>
  );
};

export default GlobalDataCheck;