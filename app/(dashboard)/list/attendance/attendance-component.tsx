// app/list/attendance/attendance-component.tsx
"use client";

import { useState, useEffect } from "react";
import Select from "react-select";
import Table from "@/components/table";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

type Filters = {
  date: string;
  gradeId: string;
  classId: string;
};

type Student = {
  id: string;
  name: string;
  status: "PRESENT" | "ABSENT" | "EXCUSED" |"LATE"
};

export function AttendanceComponent({ relatedData }: { relatedData: any }) {
  const [filters, setFilters] = useState<Filters>({
    date: new Date().toISOString().split('T')[0],
    gradeId: "",
    classId: "",
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [markingMode, setMarkingMode] = useState<"PRESENT" | "ABSENT" | "NONE">("NONE");
  const [isLoading, setIsLoading] = useState(false);
  const [filteredClasses, setFilteredClasses] = useState<any[]>([]);

  useEffect(() => {
    if (filters.gradeId) {
      const classes = relatedData.classes.filter((cls: any) => cls.gradeId.toString() === filters.gradeId);
      setFilteredClasses(classes);
    } else {
      setFilteredClasses(relatedData.classes);
    }
  }, [filters.gradeId, relatedData.classes]);

  const fetchStudents = async () => {
    if (!filters.classId || !filters.date) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/attendance?classId=${filters.classId}&date=${filters.date}`);
      const data = await response.json();
      setStudents(data.students);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [filters.classId, filters.date]);

  const handleFilterChange = (name: string, value: any) => {
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
  };

  const handleMarkingModeChange = (mode: "PRESENT" | "ABSENT" | "NONE") => {
    setMarkingMode(mode);
    if (mode === "NONE") {
      setStudents(students.map(student => ({ ...student, status: "PRESENT" })));
    }
  };

  const handleStudentStatusChange = (studentId: string) => {
    setStudents(students.map(student => 
      student.id === studentId
        ? { ...student, status: student.status === "PRESENT" ? "ABSENT" : "PRESENT" }
        : student
    ));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: filters.date, classId: filters.classId, students }),
      });
      if (!response.ok) {
        throw new Error('Failed to submit attendance');
      }
      toast.success("Attendance submitted successfully!");
    } catch (error) {
      console.error("Error submitting attendance:", error);
      toast.error("Failed to submit attendance. Please try again.");
    }
  };

  const columns = [
    { header: "Student Name", accessor: "name" },
    { header: "Status", accessor: "status" },
  ];

  const renderRow = (student: Student) => (
    <tr key={student.id} className="border-b border-gray-200 hover:bg-gray-100">
      <td className="p-2">{student.name}</td>
      <td className="p-2">
        <button
          onClick={() => handleStudentStatusChange(student.id)}
          className={`px-2 py-1 rounded ${
            student.status === "PRESENT" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {student.status}
        </button>
      </td>
    </tr>
  );

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="date"
          value={filters.date}
          onChange={(e) => handleFilterChange("date", e.target.value)}
          className="p-2 border rounded"
        />
        <Select
          options={relatedData.grades.map((g:any) => ({ value: g.id.toString(), label: g.levelName }))}
          onChange={(selectedOption: any) => {
            handleFilterChange("gradeId", selectedOption ? selectedOption.value : "");
            handleFilterChange("classId", "");
          }}
          placeholder="Select Grade"
          className="react-select-container"
          classNamePrefix="react-select"
        />
        <Select
          options={filteredClasses.map((c) => ({ value: c.id.toString(), label: c.name }))}
          onChange={(selectedOption: any) => handleFilterChange("classId", selectedOption ? selectedOption.value : "")}
          placeholder="Select Class"
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      <div className="flex justify-between mb-4">
        <div>
          <button
            onClick={() => handleMarkingModeChange("PRESENT")}
            className={`mr-2 px-4 py-2 rounded ${markingMode === "PRESENT" ? "bg-green-500 text-white" : "bg-gray-200"}`}
          >
            Mark Present
          </button>
          <button
            onClick={() => handleMarkingModeChange("ABSENT")}
            className={`mr-2 px-4 py-2 rounded ${markingMode === "ABSENT" ? "bg-red-500 text-white" : "bg-gray-200"}`}
          >
            Mark Absent
          </button>
          <button
            onClick={() => handleMarkingModeChange("NONE")}
            className={`px-4 py-2 rounded ${markingMode === "NONE" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            All Present
          </button>
        </div>
        <div className="flex">
          <input
            type="text"
            placeholder="Search student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border rounded-l"
          />
          <button className="bg-blue-500 text-white px-4 rounded-r">
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={filteredStudents} />
      )}

      <button
        onClick={handleSubmit}
        className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Submit Attendance
      </button>
    </>
  );
}