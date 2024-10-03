"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../input-field";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useFormState } from "react-dom"; // Note: Update this import if necessary.
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ResultSchema, resultSchema, ExamType } from "@/schemas/result-schema"; // Adjust path as needed
import { createResult, updateResult } from "@/actions/result-actions";

const ResultForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: ResultSchema; // Use the inferred type for data
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any; // Define this type as needed
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset, // Use reset to clear form values when switching between create and update
  } = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema),
    defaultValues: data,
  });

  const [state, formAction] = useFormState(
    type === "create" ? createResult : updateResult,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    formAction(data);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Result has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { students, subjects, academicYears, grades } = relatedData;

  useEffect(() => {
    if (data) {
      reset(data); // Reset the form with existing data when updating
    }
  }, [data, reset]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new result" : "Update the result"}
      </h1>
      <InputField
        label="Score"
        name="score"
        type="number"
        register={register}
        error={errors.score}
      />
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-xs text-gray-500">Student</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("studentId")}
          >
            {students.map((student: { id: string; name: string }) => (
              <option value={student.id} key={student.id}>
                {student.name}
              </option>
            ))}
          </select>
          {errors.studentId && (
            <p className="text-xs text-red-400">{errors.studentId.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-xs text-gray-500">Subject</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("subjectId")}
          >
            {subjects.map((subject: { id: number; name: string }) => (
              <option value={subject.id} key={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjectId && (
            <p className="text-xs text-red-400">{errors.subjectId.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-xs text-gray-500">Academic Year</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("academicYearId")}
          >
            {academicYears.map((year: { id: number; year: number }) => (
              <option value={year.id} key={year.id}>
                {year.year}
              </option>
            ))}
          </select>
          {errors.academicYearId && (
            <p className="text-xs text-red-400">{errors.academicYearId.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-xs text-gray-500">Grade</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gradeId")}
          >
            {grades.map((grade: { id: number; levelName: string }) => (
              <option value={grade.id} key={grade.id}>
                {grade.levelName}
              </option>
            ))}
          </select>
          {errors.gradeId && (
            <p className="text-xs text-red-400">{errors.gradeId.message}</p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full md:w-1/3">
        <label className="text-xs text-gray-500">Exam Type</label>
        <select
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          {...register("examType")}
        >
          {Object.values(ExamType).map((type) => (
            <option value={type} key={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.examType && (
          <p className="text-xs text-red-400">{errors.examType.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <InputField
          label="Result Grade (optional)"
          name="resultGrade"
          type="text"
          register={register}
          error={errors.resultGrade}
        />
        <InputField
          label="Remarks (optional)"
          name="remarks"
          type="text"
          register={register}
          error={errors.remarks}
        />
      </div>
      {data && (
        <input type="hidden" value={data.id} {...register("id")} />
      )}
      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ResultForm;
