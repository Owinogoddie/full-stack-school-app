// app/feeStructures/FeeStructureList.tsx
"use client";

import React from "react";
import FormContainer from "@/components/form-container";
import Pagination from "@/components/pagination";
import Table from "@/components/table";
import TableSearch from "@/components/table-search";
import {
  FeeStructure,
  FeeType,
  Term,
  AcademicYear,
  Grade,
  Class,
  StudentCategory,
  SpecialProgramme,
} from "@prisma/client";
import Image from "next/image";
import ClientOnlyComponent from "@/components/client-only-component";
import { useSession } from "@clerk/nextjs";

type FeeStructureListType = Omit<FeeStructure, 'categories'> & {
  feeType: FeeType;
  term: Term | null;
  academicYear: AcademicYear;
  grades: Grade[];
  classes: Class[];
  categories: StudentCategory[];
  specialProgrammes: SpecialProgramme[];
};

interface Column {
  header: string;
  accessor: string;
  className?: string;
}

interface FeeStructureListProps {
  data: FeeStructureListType[];
  count: number;
  searchParams: { [key: string]: string | undefined };
}

const FeeStructureList: React.FC<FeeStructureListProps> = ({
  data,
  count,
  searchParams,
}) => {
  const { session } = useSession();
  const role = session?.user?.publicMetadata?.role as string | undefined;

  const columns: Column[] = [
    { header: "Academic Year", accessor: "academicYear.year" },
    { header: "Term", accessor: "term.name" },
    { header: "Fee Type", accessor: "feeType.name" },
    { header: "Categories", accessor: "categories" },
    { header: "Grades", accessor: "grades" },
    { header: "Classes", accessor: "classes" },
    { header: "Amount", accessor: "amount" },
    { header: "Frequency", accessor: "frequency" },
    { header: "Due Date", accessor: "dueDate" },
    { header: "Status", accessor: "isActive" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: FeeStructureListType) => {
    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
      >
        <td className="p-4">{item.academicYear.year}</td>
        <td className="p-4">{item.term?.name || "-"}</td>
        <td className="p-4">{item.feeType.name}</td>
        <td className="p-4">
          {item.categories.map(c => c.name).join(", ")}
        </td>
        <td className="p-4">
          {item.grades.map(g => g.levelName).join(", ")}
        </td>
        <td className="p-4">
          {item.classes.length > 0 
            ? item.classes.map(c => c.name).join(", ")
            : "-"}
        </td>
        <td className="p-4">{item.amount.toFixed(2)}</td>
        <td className="p-4">{item.frequency}</td>
        <td className="p-4">{new Date(item.dueDate).toLocaleDateString()}</td>
        <td className="p-4">{item.isActive ? "Active" : "Inactive"}</td>
        {role === "admin" && (
          <td className="p-4">
            <ClientOnlyComponent>
              <div className="flex items-center gap-2">
                <FormContainer
                  table="feeStructure"
                  type="update"
                  data={item}
                />
                <FormContainer 
                  table="feeStructure" 
                  type="delete" 
                  id={item.id} 
                />
              </div>
            </ClientOnlyComponent>
          </td>
        )}
      </tr>
    );
  };

  const { page } = searchParams;
  const p = page ? parseInt(page) : 1;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          All Fee Structures
        </h1>
        <ClientOnlyComponent>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/filter.png" alt="" width={14} height={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/sort.png" alt="" width={14} height={14} />
              </button>
              {role === "admin" && (
                <FormContainer table="feeStructure" type="create" />
              )}
            </div>
          </div>
        </ClientOnlyComponent>
      </div>
      <ClientOnlyComponent>
        <Table columns={columns} renderRow={renderRow} data={data} />
      </ClientOnlyComponent>
      <Pagination page={p} count={count} />
    </div>
  );
};

export default FeeStructureList;