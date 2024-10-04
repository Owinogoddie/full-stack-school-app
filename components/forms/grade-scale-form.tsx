"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../input-field";
import SelectField from "../select-field";
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
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GradeScaleSchema>({
    resolver: zodResolver(gradeScaleSchema),
    defaultValues: {
      ...data,
      schoolId: data?.schoolId?.toString(),
      subjectId: data?.subjectId,
      examType:data?.examType,
      isDefault: data?.isDefault || false,
    },
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
// console.log(data)
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
        />
        <InputField
          label="Letter Grade"
          name="letterGrade"
          register={register}
          error={errors.letterGrade}
          placeholder="Enter letter grade"
        />
        <InputField
          label="Minimum Score"
          name="minScore"
          type="number"
          register={register}
          error={errors.minScore}
          placeholder="Enter minimum score"
        />
        <InputField
          label="Maximum Score"
          name="maxScore"
          type="number"
          register={register}
          error={errors.maxScore}
          placeholder="Enter maximum score"
        />
        <InputField
          label="GPA"
          name="gpa"
          type="number"
          register={register}
          error={errors.gpa}
          placeholder="Enter GPA"
        />
        <InputField
          label="Description"
          name="description"
          register={register}
          error={errors.description}
          placeholder="Enter description"
        />
        {/* <SelectField
          label="School"
          options={relatedData?.schools?.map((school: any) => ({
            value: school.id,
            label: school.name,
          }))}
          name="schoolId"
          register={register}
          setValue={setValue}
          error={errors.schoolId}
        /> */}
        <SelectField
          label="Subject"
          options={relatedData?.subjects?.map((subject: any) => ({
            value: subject.id,
            label: subject.name,
          }))}
          name="subjectId"
          register={register}
          setValue={setValue}
          error={errors.subjectId}
        />
        <SelectField
          label="Exam Type"
          options={[
            { value: "MIDTERM", label: "Midterm" },
            { value: "END_TERM", label: "End Term" },
            { value: "MOCK", label: "Mock" },
            { value: "FINAL", label: "Final" },
            { value: "ASSIGNMENT", label: "Assignment" },
            { value: "QUIZ", label: "Quiz" },
            { value: "NATIONAL", label: "National" },
          ]}
          name="examType"
          register={register}
          setValue={setValue}
          error={errors.examType}
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
