"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../input-field";
import SelectField from "../select-field";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ExamSchema, examSchema } from "@/schemas/exam-schema";
import { createExam, updateExam } from "@/actions/exams-actions";
import GlobalDataCheck from "../global-data-check-component";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

const ExamForm = ({
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
  } = useForm<ExamSchema>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      ...data,
      startDate: data?.startDate ? new Date(data.startDate).toISOString().split("T")[0] : undefined,
      endDate: data?.endDate ? new Date(data.endDate).toISOString().split("T")[0] : undefined,
      lessonId: data?.lessonId,
      subjectId: data?.subjectId,
      gradeId: data?.gradeId,
      academicYearId: data?.academicYearId,
      schoolId: data?.schoolId?.toString(),
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
      responseState = await createExam(formData);
    } else {
      responseState = await updateExam({
        ...formData,
        id: data?.id,
      });
    }

    setState(responseState);
  });

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Exam has been ${type === "create" ? "created" : "updated"}!`
      );
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      state.messages?.forEach((message: string) => toast.error(message));
    }
  }, [state, router, type, setOpen]);
console.log(relatedData)
  return (

    <GlobalDataCheck relatedData={relatedData}>
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new exam" : "Update the exam"}
      </h1>

      <div className="flex flex-wrap gap-4">
        <InputField
          label="Title"
          name="title"
          register={register}
          error={errors.title}
          placeholder="Enter exam title"
        />
        <InputField
          label="Description"
          name="description"
          register={register}
          error={errors.description}
          placeholder="Enter exam description"
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
        <InputField
          label="Start Date"
          name="startDate"
          type="date"
          register={register}
          error={errors.startDate}
        />
        <InputField
          label="End Date"
          name="endDate"
          type="date"
          register={register}
          error={errors.endDate}
        />
        <SelectField
          label="Lesson"
          options={relatedData?.lessons?.map((lesson: any) => ({
            value: lesson.id,
            label: lesson.name,
          }))}
          name="lessonId"
          register={register}
          setValue={setValue}
          error={errors.lessonId}
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
          "Create Exam"
        ) : (
          "Update Exam"
        )}
      </button>
    </form>
    </GlobalDataCheck>
  );
};

export default ExamForm;