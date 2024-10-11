'use client'

import { useState, useEffect } from "react";
import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function YearCheck() {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isCurrentYearValid, setIsCurrentYearValid] = useState(true);

  useEffect(() => {
    async function checkAcademicYear() {
      const response = await fetch('/api/check-year');
      const { hasCurrentYear, userRole } = await response.json();

      if (!hasCurrentYear) {
        setIsCurrentYearValid(false);
        if (userRole === "admin") {
          setNotificationMessage("There is no current academic year. Please add a current year to avoid errors.");
        } else if (userRole === "teacher") {
          setNotificationMessage("The current academic year has expired. Please ask an admin to add a new current year as soon as possible to avoid errors.");
        }
        setShowNotification(true);
      }
    }

    checkAcademicYear();
  }, []);
// console.log(isCurrentYearValid)
  if (showNotification && !isCurrentYearValid) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
          <p>{notificationMessage}</p>
        </div>
        <button onClick={() => setShowNotification(false)}>
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return null;
}