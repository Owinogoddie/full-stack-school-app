'use client';

import { useState, useEffect } from 'react';
import FormModal from "./form-modal";

export type FormContainerProps = {
  table:
  | "teacher"
  | "student"
  | "parent"
  | "subject"
  | "class"
  | "grade"
  | "lesson"
  | "exam"
  | "assignment"
  | "result"
  | "attendance"
  | "event"
  | "announcement"
  | "department"
  | "examSchedule"
  | "gradeScale"
  | "academicYear"
  | "studentCategory"
  | "feeType"
  | "term"
  | "feeTemplate"
  | "feeTransaction"
  | "feeException";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

const FormContainer = ({ table, type, data, id }: FormContainerProps) => {
  const [relatedData, setRelatedData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      if (type !== "delete") {
        const response = await fetch(`/api/form-data?table=${table}&type=${type}`);
        const data = await response.json();
        setRelatedData(data);
      }
    };

    fetchData();
  }, [table, type]);

  return (
    <FormModal
      table={table}
      type={type}
      relatedData={relatedData}
      data={data}
      id={id}
    />
  );
};

export default FormContainer;