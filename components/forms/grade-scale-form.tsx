"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import InputField from "../input-field";
import MultiSelect from "../multi-select";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { GradeScaleSchema, gradeScaleSchema } from "@/schemas/grade-scale-schema";
import { createGradeScale, updateGradeScale } from "@/actions/grade-scale-actions";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

const GradeScaleForm = ({
  type,
  data,
  setOpen,
  // relatedData,
}: {
  type: "create" | "update";
  data?: any;
  relatedData:any;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const {
    register,
    control,
    handleSubmit,
    // setValue,
    formState: { errors, isSubmitting },
  } = useForm<GradeScaleSchema>({
    resolver: zodResolver(gradeScaleSchema),
    defaultValues: {
      ...data,
      schoolId: data?.schoolId?.toString(),
      examTypes: data?.examTypes || [],
      isDefault: data?.isDefault || false,
      ranges: data?.ranges || [{ letterGrade: '', minScore: 0, maxScore: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ranges",
  });

  const router = useRouter();

  const [state, setState] = useState<ResponseState>({
    success: false,
    error: false,
  });

  const onSubmit = handleSubmit(async (formData) => {
    let responseState: ResponseState;
    if (type === "create") {
      responseState = await createGradeScale(formData);
    } else {
      responseState = await updateGradeScale({
        ...formData,
        id: data?.id,
      });
    }

    setState(responseState);
  });

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Grade scale has been ${type === "create" ? "created" : "updated"}!`
      );
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      state.messages?.forEach((message: string) => toast.error(message));
    }
  }, [state, router, type, setOpen]);

  const examTypeOptions = [
    { id: "MIDTERM", label: "Midterm" },
    { id: "END_TERM", label: "End Term" },
    { id: "MOCK", label: "Mock" },
    { id: "FINAL", label: "Final" },
    { id: "ASSIGNMENT", label: "Assignment" },
    { id: "QUIZ", label: "Quiz" },
    { id: "NATIONAL", label: "National" },
  ];

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new grade scale" : "Update the grade scale"}
      </h1>

      <div className="flex flex-wrap gap-4">
        <InputField
          label="Name"
          name="name"
          register={register}
          error={errors.name}
          placeholder="Enter grade scale name"
          fullWidth
        />
        <Controller
          name="examTypes"
          control={control}
          render={({ field }) => (
            <MultiSelect
              label="Exam Types"
              options={examTypeOptions}
              value={field.value || []}
              onChange={(newValue) => field.onChange(newValue)}
              error={errors.examTypes}
            />
          )}
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isDefault"
            {...register("isDefault")}
          />
          <label htmlFor="isDefault" className="text-sm text-gray-600">
            Is Default
          </label>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Grade Ranges</h2>
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-wrap gap-4 mb-4">
            <InputField
              label="Letter Grade"
              name={`ranges.${index}.letterGrade`}
              register={register}
              error={errors.ranges?.[index]?.letterGrade}
              placeholder="Enter letter grade"
            />
            <InputField
              label="Minimum Score"
              name={`ranges.${index}.minScore`}
              type="number"
              register={register}
              error={errors.ranges?.[index]?.minScore}
              placeholder="Enter minimum score"
            />
            <InputField
              label="Maximum Score"
              name={`ranges.${index}.maxScore`}
              type="number"
              register={register}
              error={errors.ranges?.[index]?.maxScore}
              placeholder="Enter maximum score"
            />
            <InputField
              label="GPA"
              name={`ranges.${index}.gpa`}
              type="number"
              register={register}
              error={errors.ranges?.[index]?.gpa}
              placeholder="Enter GPA"
            />
            <InputField
              label="Description"
              name={`ranges.${index}.description`}
              register={register}
              error={errors.ranges?.[index]?.description}
              placeholder="Enter description"
              fullWidth
            />
            <button type="button" onClick={() => remove(index)} className="bg-red-400 text-white p-2 rounded-md">
              Remove Range
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ letterGrade: '', minScore: 0, maxScore: 0 })}
          className="bg-green-400 text-white p-2 rounded-md"
        >
          Add Range
        </button>
      </div>

      <button
        type="submit"
        className="bg-blue-400 text-white p-2 rounded-md relative"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
          </div>
        ) : type === "create" ? (
          "Create Grade Scale"
        ) : (
          "Update Grade Scale"
        )}
      </button>
    </form>
  );
};

export default GradeScaleForm;