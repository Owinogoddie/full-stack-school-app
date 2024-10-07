"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import Table from "@/components/table";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

type RelatedData = {
  academicYears: any[];
  classes: any[];
  grades: any[];
  exams: any[];
  subjects: any[];
};

type Filters = {
  academicYearId: string;
  examIds: string[];
  classId: string;
  gradeId: string;
  subjectIds: string[];
  search: string;
};



type RankingItem = {
  rank: number;
  studentName: string;
  overallAverage: number;
  subjectAverages: { name: string; averageScore: number }[];
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

export function ResultsRankingComponent({
  relatedData,
  schoolName,
}: {
  relatedData: RelatedData;
  schoolName: string;
}) {
  const [filters, setFilters] = useState<Filters>({
    academicYearId: "",
    examIds: [],
    classId: "",
    gradeId: "",
    subjectIds: [],
    search: "",
  });
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const router = useRouter();

  const fetchRanking = useCallback(async () => {
    if (!filters.academicYearId || filters.examIds.length === 0 || (!filters.classId && !filters.gradeId) || filters.subjectIds.length === 0) {
      setRanking([]);
      return;
    }

    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.set("academicYearId", filters.academicYearId);
      filters.examIds.forEach(id => queryParams.append("examIds[]", id));
      if (filters.classId) queryParams.set("classId", filters.classId);
      if (filters.gradeId) queryParams.set("gradeId", filters.gradeId);
      filters.subjectIds.forEach(id => queryParams.append("subjectIds[]", id));
      queryParams.set("order", order);
      if (filters.search) queryParams.set("search", filters.search);

      router.replace(`?${queryParams.toString()}`, { scroll: false });

      const response = await fetch(`/api/results/ranking?${queryParams}`);
      const data = await response.json();
      setRanking(data.ranking);
    } catch (error) {
      console.error("Error fetching ranking:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, order, router]);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  const handleFilterChange = (name: string, value: any) => {
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handleOrderChange = (selectedOption: any) => {
    setOrder(selectedOption.value);
  };

  const handleSearch = () => {
    fetchRanking();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();

      // Add logo and school name
      const logoImg = new Image();
      logoImg.src = "/logo.png";

      const pageWidth = doc.internal.pageSize.width;
      const logoWidth = 10;
      const logoHeight = 10;

      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");

      const schoolNameWidth = doc.getTextWidth(schoolName);
      const totalContentWidth = logoWidth + 5 + schoolNameWidth;
      const startX = (pageWidth - totalContentWidth) / 2;

      doc.addImage(logoImg, "PNG", startX, 10, logoWidth, logoHeight);
      doc.text(schoolName, startX + logoWidth + 5, 17);

      // Add title and filters
      doc.setFontSize(18);
      doc.setTextColor(0, 102, 204);
      doc.text("Student Ranking Report", 14, 40);

      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.setFont("helvetica", "normal");
      let yPos = 50;

      const addFilterInfo = (label: string, value: string) => {
        if (value) {
          doc.setFont("helvetica", "bold");
          doc.text(`${label}:`, 14, yPos);
          doc.setFont("helvetica", "normal");
          doc.text(value, 45, yPos);
          yPos += 6;
        }
      };

      addFilterInfo(
        "Academic Year",
        relatedData.academicYears.find((ay) => ay.id.toString() === filters.academicYearId)
          ?.year || ""
      );
      addFilterInfo(
        "Class",
        relatedData.classes.find((c) => c.id.toString() === filters.classId)?.name || ""
      );
      addFilterInfo(
        "Grade",
        relatedData.grades.find((g) => g.id.toString() === filters.gradeId)?.levelName || ""
      );

      // Add ranking table
      const tableColumn = ["Rank", "Student", "Overall Average", ...ranking[0]?.subjectAverages.map((s) => s.name) || []];
      const tableRows = ranking.map((item, index) => [
        index + 1,
        item.studentName,
        item.overallAverage.toFixed(2),
        ...item.subjectAverages.map((s) => s.averageScore.toFixed(2)),
      ]);

      (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: yPos + 10,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [0, 102, 204], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        tableLineColor: [200, 200, 200],
        tableLineWidth: 0.1,
      });

      // Add footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
        doc.text(
          `Generated on ${new Date().toLocaleString()}`,
          14,
          doc.internal.pageSize.height - 10
        );
      }

      doc.save("student_ranking_report.pdf");
    } catch (error) {
      console.error("Error exporting to PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const columns = [
    { header: "Rank", accessor: "rank" },
    { header: "Student", accessor: "studentName" },
    { header: "Overall Average", accessor: "overallAverage" },
    ...filters.subjectIds.map((subjectId) => ({
      header: relatedData.subjects.find(s => s.id.toString() === subjectId)?.name || "Unknown Subject",
      accessor: `subject_${subjectId}`,
    })),
  ];
  const renderRow = (item: RankingItem) => (
    <tr key={item.rank} className="border-b border-gray-200 hover:bg-gray-100">
      <td className="p-2">{item.rank}</td>
      <td className="p-2">{item.studentName}</td>
      <td className="p-2">{item.overallAverage.toFixed(2)}</td>
      {item.subjectAverages.map((subject, subIndex) => (
        <td key={subIndex} className="p-2">{subject.averageScore.toFixed(2)}</td>
      ))}
    </tr>
  );
// console.log(relatedData)
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Select
          options={relatedData.academicYears.map((ay) => ({ value: ay.id.toString(), label: ay.year }))}
          onChange={(selectedOption: any) => handleFilterChange("academicYearId", selectedOption ? selectedOption.value : "")}
          placeholder="Select Academic Year"
          className="react-select-container"
          classNamePrefix="react-select"
        />
        <Select
          options={relatedData.exams.map((exam) => ({ value: exam.id.toString(), label: exam.title }))}
          onChange={(selectedOptions: any) => handleFilterChange("examIds", selectedOptions ? selectedOptions.map((option: any) => option.value) : [])}
          placeholder="Select Exams"
          isMulti
          className="react-select-container"
          classNamePrefix="react-select"
        />
        <Select
          options={relatedData.grades.map((g) => ({ value: g.id.toString(), label: g.levelName }))}
          onChange={(selectedOption: any) => {
            handleFilterChange("gradeId", selectedOption ? selectedOption.value : "");
            handleFilterChange("classId", ""); // Clear class selection when grade is selected
          }}
          placeholder="Select Grade"
          className="react-select-container"
          classNamePrefix="react-select"
        />
        <Select
          options={relatedData.classes.map((c) => ({ value: c.id.toString(), label: c.name }))}
          onChange={(selectedOption: any) => {
            handleFilterChange("classId", selectedOption ? selectedOption.value : "");
            handleFilterChange("gradeId", ""); // Clear grade selection when class is selected
          }}
          placeholder="Select Class"
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      <div className="mb-6">
        <h3 className="mb-2">Select Subjects:</h3>
        <div className="flex flex-wrap gap-4">
          {relatedData.subjects.map((subject) => (
            <label key={subject.id} className="flex items-center">
              <input
                type="checkbox"
                value={subject.id}
                checked={filters.subjectIds.includes(subject.id.toString())}
                onChange={(e) => {
                  const updatedSubjects = e.target.checked
                    ? [...filters.subjectIds, e.target.value]
                    : filters.subjectIds.filter(id => id !== e.target.value);
                  handleFilterChange("subjectIds", updatedSubjects);
                }}
                className="mr-2"
              />
              {subject.name}
            </label>
          ))}
        </div>
      </div>

      <div className="flex mb-4">
        <Select
          options={[
            { value: "desc", label: "Highest to Lowest" },
            { value: "asc", label: "Lowest to Highest" },
          ]}
          onChange={handleOrderChange}
          placeholder="Rank Order"
          className="react-select-container w-48 mr-4"
          classNamePrefix="react-select"
        />
        <input
          type="text"
          name="search"
          placeholder="Search student..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-grow bg-gray-200 border border-gray-200 text-gray-700 py-2 px-4 rounded-l leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>
      </div>

      <button
        onClick={exportToPDF}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
        disabled={isExporting}
      >
        {isExporting ? 'Exporting...' : 'Export to PDF'}
      </button>

      {isLoading ? (
        <LoadingSpinner />
      ) : ranking.length > 0 ? (
        <Table columns={columns} renderRow={renderRow} data={ranking} />
      ) : (
        <div className="text-center py-8">
          <p className="text-xl text-gray-600">
            No results found. Please adjust your filters.
          </p>
        </div>
      )}
    </>
  );
}