// app/(dashboard)/fees/payment-summary/_components/PaymentSummaryModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SelectField from "@/components/select-field";
import { getTerms, getClasses } from "@/actions/fees/data-fetching";
import DateRangePicker from "@/components/date-range/date-range-picker";

const schema = z.object({
  academicYearId: z.coerce.number().positive("Academic Year is required"),
  termId: z.string().min(1, "Term is required"),
  gradeId: z.coerce.number().optional(),
  classId: z.coerce.number().optional(),
  feeStructureIds: z.array(z.string()).default([]),
  dateRange: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .optional(),
  paymentStatus: z
    .enum(["ALL", "PENDING", "PARTIAL", "COMPLETED", "OVERDUE"])
    .default("ALL"),
  paymentType: z.enum(["ALL", "CASH", "BANK", "MOBILE_MONEY"]).default("ALL"),
});

type FormData = z.infer<typeof schema>;

interface InitialData {
  academicYears: { id: number; year: string }[];
  grades: { id: number; name: string }[];
  feeStructures: { id: string; name: string; amount: number }[];
}

interface Props {
  initialData: InitialData;
  onSubmit: (data: FormData) => void;
}

export default function PaymentSummaryModal({ initialData, onSubmit }: Props) {
  const [terms, setTerms] = useState<{ id: string; name: string }[]>([]);
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
const selectedAcademicYearId = watch('academicYearId');
const selectedGradeId = watch('gradeId');

useEffect(() => {
  if (selectedAcademicYearId) {
    getTerms(selectedAcademicYearId).then(setTerms);
  }
}, [selectedAcademicYearId]);

useEffect(() => {
  if (selectedGradeId) {
    getClasses(selectedGradeId).then(setClasses);
  }
}, [selectedGradeId]);
useEffect(() => {
  if (Object.keys(errors).length > 0) {
    console.log("Validation errors:", errors);
  }
}, [errors]);
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Payment Summary Filters</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Academic Year and Term selectors */}
          <SelectField
            label="Academic Year"
            name="academicYearId"
            register={register}
            error={errors.academicYearId}
            options={initialData.academicYears.map((year) => ({
              value: year.id.toString(),
              label: year.year,
            }))}
            setValue={setValue}
          />
          <SelectField
            setValue={setValue}
            label="Term"
            name="termId"
            register={register}
            error={errors.termId}
            options={terms.map((term) => ({
              value: term.id,
              label: term.name,
            }))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Grade and Class selectors */}
          <SelectField
            setValue={setValue}
            label="Grade (Optional)"
            name="gradeId"
            register={register}
            error={errors.gradeId}
            options={[
              { value: "", label: "All Grades" },
              ...initialData.grades.map((grade) => ({
                value: grade.id.toString(),
                label: grade.name,
              })),
            ]}
          />
          <SelectField
            setValue={setValue}
            label="Class (Optional)"
            name="classId"
            register={register}
            error={errors.classId}
            options={[
              { value: "", label: "All Classes" },
              ...classes.map((cls) => ({
                value: cls.id.toString(),
                label: cls.name,
              })),
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField
            setValue={setValue}
            label="Payment Status"
            name="paymentStatus"
            register={register}
            error={errors.paymentStatus}
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: "PENDING", label: "Pending" },
              { value: "PARTIAL", label: "Partial" },
              { value: "COMPLETED", label: "Completed" },
              { value: "OVERDUE", label: "Overdue" },
            ]}
          />
          <SelectField
            setValue={setValue}
            label="Payment Type"
            name="paymentType"
            register={register}
            error={errors.paymentType}
            options={[
              { value: "ALL", label: "All Types" },
              { value: "CASH", label: "Cash" },
              { value: "BANK", label: "Bank" },
              { value: "MOBILE_MONEY", label: "Mobile Money" },
            ]}
          />
        </div>

        <DateRangePicker
          label="Date Range (Optional)"
          name="dateRange"
          register={register}
          setValue={setValue}
          error={errors.dateRange}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fee Structures
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {initialData.feeStructures.map((fee) => (
              <label key={fee.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={fee.id}
                  {...register("feeStructureIds")}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {fee.name} (
                  {new Intl.NumberFormat("en-KE", {
                    style: "currency",
                    currency: "KES",
                  }).format(fee.amount)}
                  )
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md 
                                 transition duration-150 ease-in-out focus:outline-none focus:ring-2 
                                 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Summary
          </button>
        </div>
      </form>
    </div>
  );
}
