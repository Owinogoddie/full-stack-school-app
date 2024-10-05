// File: components/ResultsFilterComponent.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import Table from "@/components/table";
import Pagination from "@/components/pagination";
import Select from "react-select";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import jsPDF from "jspdf";
import "jspdf-autotable";

type RelatedData = {
  exams: any[];
  subjects: any[];
  academicYears: any[];
  classes: any[];
  grades: any[];
};

type Filters = {
  examId: string;
  subjectId: string;
  academicYearId: string;
  classId: string;
  gradeId: string;
  search: string;
};

type Result = {
  id: string;
  studentName: string;
  examName: string;
  subjectName: string;
  academicYearName: string;
  gradeName: string;
  className: string | null;
  score: number;
  resultGrade: string | null;
  remarks: string | null;
};

export function ResultsFilterComponent({
  relatedData,
  schoolName,
}: {
  relatedData: RelatedData;
  schoolName: string;
}) {
  const [filters, setFilters] = useState<Filters>({
    examId: "",
    subjectId: "",
    academicYearId: "",
    classId: "",
    gradeId: "",
    search: "",
  });
  const [results, setResults] = useState<Result[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState<number>(1);
  const [, setImmediateSearch] = useState("");
  const [ranking, setRanking] = useState<"asc" | "desc">("desc");
  const [stats, setStats] = useState<{
    mean: number;
    min: number;
    max: number;
  } | null>(null);

  const debouncedSearch = useDebounce(filters.search, 1000);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const queryPage = parseInt(searchParams.get("page") as string) || 1;
    if (queryPage !== page) {
      setPage(queryPage);
    }
  }, [searchParams, page]);

  const fetchResults = useCallback(
    async (searchTerm: string, isExport = false) => {
      const hasFiltersApplied =
        Object.entries(filters).some(
          ([key, value]) => key !== "search" && value !== ""
        ) || searchTerm !== "";

      if (!hasFiltersApplied && !isExport) {
        setResults([]);
        setCount(0);
        setStats(null);
        return;
      }

      const queryParams = new URLSearchParams(
        Object.entries({ ...filters, search: searchTerm }).filter(
          ([, value]) => value !== ""
        )
      );
      queryParams.set("page", page.toString());
      if (isExport) queryParams.set("export", "true");

      if (!isExport) {
        router.replace(`?${queryParams.toString()}`, { scroll: false });
      }

      const response = await fetch(`/api/results/filter?${queryParams}`);
      const data = await response.json();
      const sortedResults = data.results.sort((a: Result, b: Result) =>
        ranking === "desc" ? b.score - a.score : a.score - b.score
      );

      if (!isExport) {
        setResults(sortedResults);
        setCount(data.count);

        if (sortedResults.length > 0) {
          const scores = sortedResults.map((r: Result) => r.score);
          setStats({
            mean: scores.reduce((a: any, b: any) => a + b, 0) / scores.length,
            min: Math.min(...scores),
            max: Math.max(...scores),
          });
        } else {
          setStats(null);
        }
      }

      return sortedResults;
    },
    [filters, page, router, ranking]
  );

  useEffect(() => {
    fetchResults(debouncedSearch);
  }, [fetchResults, debouncedSearch]);

  const handleFilterChange = (name: string, value: string) => {
    const filterName =
      name === "classes" ? "classId" : name.replace(/s$/, "Id");
    setFilters((prevFilters) => ({ ...prevFilters, [filterName]: value }));
    // Only reset page if it's not an export action
    if (name !== "export") {
      setPage(1);
    }
  };

  const handleImmediateSearch = () => {
    fetchResults(filters.search);
    setImmediateSearch(filters.search);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleImmediateSearch();
    }
  };

  const handleRankingChange = (selectedOption: any) => {
    setRanking(selectedOption.value);
  };

  const fetchAllResultsForExport = async () => {
    const queryParams = new URLSearchParams(
      Object.entries({ ...filters, search: filters.search }).filter(
        ([, value]) => value !== ""
      )
    );
    queryParams.set("export", "true");

    const response = await fetch(`/api/results/filter?${queryParams}`);
    const data = await response.json();
    return data.results;
  };

  const exportToPDF = async () => {
    const allResults = await fetchAllResultsForExport();

    const doc = new jsPDF();

    // Add logo
    const logoImg = new Image();
    logoImg.src = "/logo.png"; // Ensure this path is correct
    doc.addImage(logoImg, "PNG", 14, 10, 20, 20); // Smaller logo

    // Add school name
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(schoolName, 40, 25);

    // Add title
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 204); // Blue color
    doc.text("Student Results Report", 14, 40);

    // Add border
    doc.setDrawColor(0, 102, 204); // Blue color
    doc.setLineWidth(0.5);
    doc.rect(
      5,
      5,
      doc.internal.pageSize.width - 10,
      doc.internal.pageSize.height - 10
    );

    // Add filters used
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
      "Class",
      relatedData.classes.find((c) => c.id.toString() === filters.classId)
        ?.name || ""
    );
    addFilterInfo(
      "Academic Year",
      relatedData.academicYears.find(
        (ay) => ay.id.toString() === filters.academicYearId
      )?.year || ""
    );
    addFilterInfo(
      "Subject",
      relatedData.subjects.find((s) => s.id.toString() === filters.subjectId)
        ?.name || ""
    );
    addFilterInfo(
      "Exam",
      relatedData.exams.find((e) => e.id.toString() === filters.examId)
        ?.title || ""
    );
    addFilterInfo(
      "Grade",
      relatedData.grades.find((g) => g.id.toString() === filters.gradeId)
        ?.levelName || ""
    );

    // Add stats
    if (stats) {
      yPos += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 102, 204); // Blue color
      doc.text(`Statistics:`, 14, yPos);
      yPos += 6;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);
      doc.setFontSize(11);
      doc.text(
        `Mean: ${stats.mean.toFixed(2)}   Min: ${stats.min}   Max: ${
          stats.max
        }`,
        14,
        yPos
      );
    }

    // Add results table
    const tableColumn = ["#", ...columns.map((col) => col.header)];
    const tableRows = allResults.map((item: Result, index: number) => [
      index + 1,
      item.studentName,
      item.subjectName,
      `${item.score} (${
        item.resultGrade && item.resultGrade !== "N/A" ? item.resultGrade : "-"
      })`,
      item.examName,
      item.academicYearName,
      item.gradeName,
      item.className,
      item.remarks,
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: yPos + 10,
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 10 }, // # column
        1: { cellWidth: 30 }, // Student Name
        2: { cellWidth: 25 }, // Subject
        3: { cellWidth: 20 }, // Score (Grade)
        4: { cellWidth: 25 }, // Exam
        5: { cellWidth: 20 }, // Academic Year
        6: { cellWidth: 15 }, // Grade
        7: { cellWidth: 15 }, // Class
        8: { cellWidth: "auto" }, // Remarks
      },
      headStyles: { fillColor: [0, 102, 204], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.1,
    });

    // Add footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      (doc as any).setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" } as any
      );
      doc.text(
        `Generated on ${new Date().toLocaleString()}`,
        14,
        doc.internal.pageSize.height - 10
      );
    }

    doc.save("student_results_report.pdf");
  };
  const columns = [
    { header: "Student", accessor: "studentName" },
    { header: "Subject", accessor: "subjectName" },
    { header: "Score (Grade)", accessor: "score" },
    {
      header: "Exam",
      accessor: "examName",
      hiddenOnSmall: true,
      className: "hidden md:table-cell",
    },
    {
      header: "Academic Year",
      accessor: "academicYearName",
      hiddenOnSmall: true,
      className: "hidden md:table-cell",
    },
    {
      header: "Grade",
      accessor: "gradeName",
      hiddenOnSmall: true,
      className: "hidden md:table-cell",
    },
    {
      header: "Class",
      accessor: "className",
      hiddenOnSmall: true,
      className: "hidden md:table-cell",
    },
    {
      header: "Remarks",
      accessor: "remarks",
      hiddenOnSmall: true,
      className: "hidden md:table-cell",
    },
  ];

  const renderRow = (item: Result) => (
    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-100">
      <td className="p-2">{item.studentName}</td>
      <td className="p-2">{item.subjectName}</td>
      <td className="p-2">
        {item.score} (
        {item.resultGrade && item.resultGrade !== "N/A"
          ? item.resultGrade
          : "-"}
        )
      </td>
      <td className="p-2 hidden md:table-cell">{item.examName}</td>
      <td className="p-2 hidden md:table-cell">{item.academicYearName}</td>
      <td className="p-2 hidden md:table-cell">{item.gradeName}</td>
      <td className="p-2 hidden md:table-cell">{item.className}</td>
      <td className="p-2 hidden md:table-cell">{item.remarks}</td>
    </tr>
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {Object.entries(relatedData).map(([key, options]) => {
          const filterKey =
            key === "classes" ? "classId" : key.replace(/s$/, "Id");

          return (
            <div key={key} className="relative">
              <Select
                options={options.map((option: any) => ({
                  value: option.id.toString(),
                  label: option.title || option.name || option.year || option.levelName,  // Added levelName for grades
                }))}
                onChange={(selectedOption: any) =>
                  handleFilterChange(
                    filterKey,
                    selectedOption ? selectedOption.value : ""
                  )
                }
                isClearable
                placeholder={`Select ${key.replace(/([A-Z])/g, " $1").trim()}`}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
          );
        })}
        <div className="relative">
          <Select
            options={[
              { value: "desc", label: "Highest to Lowest" },
              { value: "asc", label: "Lowest to Highest" },
            ]}
            onChange={handleRankingChange}
            placeholder="Rank by Score"
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
        <div className="relative flex">
          <input
            type="text"
            name="search"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            onKeyPress={handleKeyPress}
            className="block w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 rounded-l leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          />
          <button
            onClick={handleImmediateSearch}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        </div>
        <button
          onClick={exportToPDF}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Export to PDF
        </button>
      </div>

      {stats && (
        <div className="mb-4">
          <p>
            Mean: {stats.mean.toFixed(2)}, Min: {stats.min}, Max: {stats.max}
          </p>
        </div>
      )}

      {results.length > 0 ? (
        <>
          <Table columns={columns} renderRow={renderRow} data={results} />
          <Pagination page={page} count={count} />
        </>
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
