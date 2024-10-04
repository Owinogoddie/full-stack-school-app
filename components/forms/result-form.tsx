"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../input-field";
import SelectField from "../select-field";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ResultSchema, resultSchema } from "@/schemas/result-schema";
import { createResult, updateResult } from "@/actions/result-actions";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

const ResultForm = ({
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
  } = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema),
    defaultValues: {
      ...data,
      studentId: data?.studentId?.toString(),
      examId: data?.examId,
      subjectId: data?.subjectId,
      academicYearId: data?.academicYearId,
      gradeId: data?.gradeId,
      classId: data?.classId,
      gradeScaleId: data?.gradeScaleId,
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
      responseState = await createResult(formData);
    } else {
      const updatedData = {
        ...formData,
        id: data?.id || undefined, // Use undefined if id is not provided
      };
      responseState = await updateResult(updatedData);
    }

    setState(responseState);
  });

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Result has been ${type === "create" ? "created" : "updated"} successfully!`
      );
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      state.messages?.forEach((message: string) => toast.error(message));
    }
  }, [state, router, type, setOpen]);
console.log({data})
  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new result" : "Update the result"}
      </h1>

      <div className="flex flex-wrap gap-4">
        <SelectField
          label="Student"
          options={relatedData?.students?.map((student: any) => ({
            value: student.id,
            label: `${student.firstName} ${student.lastName}`,
          }))}
          name="studentId"
          register={register}
          setValue={setValue}
          error={errors.studentId}
          defaultValue={data?.studentId}
        />
        <SelectField
          label="Exam"
          options={relatedData?.exams?.map((exam: any) => ({
            value: exam.id,
            label: exam.title,
          }))}
          name="examId"
          register={register}
          setValue={setValue}
          error={errors.examId}
          defaultValue={data?.examId}
        />
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
          defaultValue={data?.subjectId}
        />
        <SelectField
          label="Academic Year"
          options={relatedData?.academicYears?.map((year: any) => ({
            value: year.id,
            label: year.year,
          }))}
          name="academicYearId"
          register={register}
          setValue={setValue}
          error={errors.academicYearId}
          defaultValue={data?.academicYearId}
        />
        <SelectField
          label="Grade"
          options={relatedData?.grades?.map((grade: any) => ({
            value: grade.id,
            label: grade.levelName,
          }))}
          name="gradeId"
          register={register}
          setValue={setValue}
          error={errors.gradeId}
          defaultValue={data?.gradeId}
        />
        <SelectField
          label="Class"
          options={relatedData?.classes?.map((class_: any) => ({
            value: class_.id,
            label: class_.name,
          }))}
          name="classId"
          register={register}
          setValue={setValue}
          error={errors.classId}
          defaultValue={data?.classId}
        />
        <InputField
          label="Score"
          name="score"
          type="number"
          register={register}
          error={errors.score}
          placeholder="Enter score"
          fullWidth
        />
        <SelectField
          label="Grade Scale"
          options={relatedData?.gradeScales?.map((scale: any) => ({
            value: scale.id,
            label: scale.name,
          }))}
          name="gradeScaleId"
          register={register}
          setValue={setValue}
          error={errors.gradeScaleId}
          defaultValue={data?.gradeScaleId}
        />
        <InputField
          label="Result Grade"
          name="resultGrade"
          register={register}
          error={errors.resultGrade}
          placeholder="Enter result grade"
        />
        <InputField
          label="Remarks"
          name="remarks"
          register={register}
          error={errors.remarks}
          placeholder="Enter remarks"
        />
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="mt-4 p-4 border border-red-300 rounded-md bg-red-50">
          <h2 className="text-red-600 font-semibold">Error:</h2>
          {state.messages ? (
            <ul className="list-disc list-inside text-red-500">
              {state.messages.map((message, index) => (
                <li key={index} className="text-sm">
                  {message}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-sm">
              {state.message || "Something went wrong!"}
            </span>
          )}
        </div>
      )}

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
          "Create"
        ) : (
          "Update"
        )}
      </button>
    </form>
  );
};

export default ResultForm;
