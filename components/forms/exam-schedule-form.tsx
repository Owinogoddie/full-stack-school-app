"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../input-field";
import SelectField from "../select-field";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { EXamScheduleSchema, examScheduleSchema } from "@/schemas/exam-schedule-schema";
import { createExamSchedule, updateExamSchedule } from "@/actions/exam-schedule";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

const ExamScheduleForm = ({
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
  } = useForm<EXamScheduleSchema>({
    resolver: zodResolver(examScheduleSchema),
    defaultValues: {
      ...data,
      date: data?.date ? new Date(data.date).toISOString().split("T")[0] : undefined,
      startTime: data?.startTime ? new Date(data.startTime).toISOString().split("T")[1].slice(0, 5) : undefined,
      endTime: data?.endTime ? new Date(data.endTime).toISOString().split("T")[1].slice(0, 5) : undefined,
      examId: data?.examId?.toString(),
      subjectId: data?.subjectId?.toString(),
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
      responseState = await createExamSchedule(formData);
    } else {
      responseState = await updateExamSchedule({
        ...formData,
        id: data?.id,
      });
    }

    setState(responseState);
  });

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Exam schedule has been ${type === "create" ? "created" : "updated"}!`
      );
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      state.messages?.forEach((message: string) => toast.error(message));
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new exam schedule" : "Update the exam schedule"}
      </h1>

      <div className="flex flex-wrap gap-4">
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
        <InputField
          label="Date"
          name="date"
          type="date"
          register={register}
          error={errors.date}
        />
        <InputField
          label="Start Time"
          name="startTime"
          type="time"
          register={register}
          error={errors.startTime}
        />
        <InputField
          label="End Time"
          name="endTime"
          type="time"
          register={register}
          error={errors.endTime}
        />
        <InputField
          label="Venue"
          name="venue"
          register={register}
          error={errors.venue}
          placeholder="Enter exam venue"
        />
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
          "Create Exam Schedule"
        ) : (
          "Update Exam Schedule"
        )}
      </button>
    </form>
  );
};

export default ExamScheduleForm;
