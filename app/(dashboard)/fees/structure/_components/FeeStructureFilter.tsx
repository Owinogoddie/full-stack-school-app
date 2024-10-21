// app/fee-structures/_components/FeeStructureFilter.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SelectField from "@/components/select-field";

const schema = z.object({
  academicYearId: z.coerce.number().positive("Academic Year is required"),
  termId: z.string().optional(),
  gradeId: z.coerce.number().optional(),
  classId: z.coerce.number().optional(),
  studentCategoryId: z.string().optional(),
  specialProgrammeId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface FeeStructureFilterProps {
  initialData: {
    academicYears: { id: number; year: string }[];
    terms: { id: string; name: string }[];
    grades: { id: number; levelName: string }[];
    classes: { id: number; name: string; gradeId: number }[];
    studentCategories: { id: string; name: string }[];
    specialProgrammes: {
      id: string;
      name: string;
      description: string | null;
    }[]; // Add this line
  };
  onFilter: (data: FormData) => void;
}

export default function FeeStructureFilter({
  initialData,
  onFilter,
}: FeeStructureFilterProps) {
  const [filteredClasses, setFilteredClasses] = useState(initialData.classes);
  const [filteredTerms, setFilteredTerms] = useState(initialData.terms);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const selectedGradeId = watch("gradeId");
  const selectedAcademicYearId = watch("academicYearId");
  // console.log(initialData)
  useEffect(() => {
    if (selectedGradeId) {
      const classes = initialData.classes.filter(
        (cls) => cls.gradeId === Number(selectedGradeId) // Convert to number for comparison
      );
      setFilteredClasses(classes);
      setValue("classId", undefined); // Reset selected class
    } else {
      setFilteredClasses(initialData.classes);
    }
  }, [selectedGradeId, initialData.classes, setValue]);

  useEffect(() => {
    if (selectedAcademicYearId) {
      // In a real application, you would fetch terms based on the academic year
      // For now, we'll just use all terms
      setFilteredTerms(initialData.terms);
    }
  }, [selectedAcademicYearId, initialData.terms, setValue]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-lg font-semibold mb-6">Filter Fee Structure</h2>
      <form onSubmit={handleSubmit(onFilter)} className="space-y-6">
        <SelectField
          label="Academic Year"
          name="academicYearId"
          register={register}
          setValue={setValue}
          error={errors.academicYearId}
          options={initialData.academicYears.map((year) => ({
            value: year.id.toString(),
            label: year.year,
          }))}
        />

        <SelectField
          label="Term (Optional)"
          name="termId"
          register={register}
          error={errors.termId}
          setValue={setValue}
          options={[
            { value: "", label: "All Terms" },
            ...filteredTerms.map((term) => ({
              value: term.id,
              label: term.name,
            })),
          ]}
        />

        <SelectField
          label="Grade (Optional)"
          name="gradeId"
          register={register}
          error={errors.gradeId}
          setValue={setValue}
          options={[
            { value: "", label: "All Grades" },
            ...initialData.grades.map((grade) => ({
              value: grade.id.toString(),
              label: grade.levelName,
            })),
          ]}
        />

        <SelectField
          label="Class (Optional)"
          name="classId"
          register={register}
          setValue={setValue}
          error={errors.classId}
          options={[
            { value: "", label: "All Classes" },
            ...filteredClasses.map((cls) => ({
              value: cls.id.toString(),
              label: cls.name,
            })),
          ]}
        />

        <SelectField
          label="Student Category (Optional)"
          name="studentCategoryId"
          register={register}
          error={errors.studentCategoryId}
          setValue={setValue}
          options={[
            { value: "", label: "All Categories" },
            ...initialData.studentCategories.map((category) => ({
              value: category.id,
              label: category.name,
            })),
          ]}
        />
        <SelectField
          label="Special Programme (Optional)"
          name="specialProgrammeId"
          register={register}
          setValue={setValue}
          error={errors.specialProgrammeId}
          options={[
            { value: "", label: "All Programmes" },
            ...initialData.specialProgrammes.map((programme) => ({
              value: programme.id,
              label: programme.name,
            })),
          ]}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md
                   transition duration-150 ease-in-out focus:outline-none focus:ring-2
                   focus:ring-blue-500 focus:ring-offset-2"
        >
          View Fee Structure
        </button>
      </form>
    </div>
  );
}
