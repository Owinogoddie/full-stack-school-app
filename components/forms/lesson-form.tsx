"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../input-field";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LessonSchema, lessonSchema } from "@/schemas/lesson-schema";
import { createLesson, updateLesson } from "@/actions/lesson-actions";
import toast from "react-hot-toast";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
};

const LessonForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: Partial<LessonSchema>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LessonSchema>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      ...data,
      startTime: data?.startTime ? new Date(data.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : "", // Format to HH:MM
      endTime: data?.endTime ? new Date(data.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : "", // Format to HH:MM
      day: data?.day,
      subjectId: data?.subjectId,
      classId: data?.classId,
      teacherId: data?.teacherId,
    },
    
  });

  const [state, setState] = useState<ResponseState>({
    success: false,
    error: false,
  });

  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    let responseState: ResponseState;
    if (type === "create") {
      responseState = await createLesson(formData);
    } else {
      responseState = await updateLesson(formData);
    }
    setState(responseState);
  });

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Lesson has been ${type === "create" ? "created" : "updated"}!`
      );
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error(state.message || "Something went wrong!");
    }
  }, [state, router, type, setOpen]);

  const { subjects, teachers, classes } = relatedData;
// console.log(data)
  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new lesson" : "Update the lesson"}
      </h1>
      <InputField
        label="Name"
        name="name"
        register={register}
        error={errors.name}
        fullWidth
        placeholder="Enter lesson name e.g Maths double"
        defaultValue={data?.name}
      />
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full ">
          <label className="text-xs text-gray-500">Day</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("day")}
          >
            <option value="MONDAY">Monday</option>
            <option value="TUESDAY">Tuesday</option>
            <option value="WEDNESDAY">Wednesday</option>
            <option value="THURSDAY">Thursday</option>
            <option value="FRIDAY">Friday</option>
          </select>
          {errors.day && (
            <p className="text-xs text-red-400">{errors.day.message}</p>
          )}
        </div>
        <InputField
          label="Start Time"
          name="startTime"
          type="time"
          register={register}
          error={errors.startTime}
          defaultValue={data?.startTime}
        />
        <InputField
          label="End Time"
          name="endTime"
          type="time"
          register={register}
          error={errors.endTime}
          
          defaultValue={data?.endTime}
        />
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-[48%]">
          <label className="text-xs text-gray-500">Subject</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("subjectId")}
          >
            {subjects.map((subject: { id: number; name: string }) => (
              <option value={subject.id.toString()} key={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjectId && (
            <p className="text-xs text-red-400">{errors.subjectId.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-[49%]">
          <label className="text-xs text-gray-500">Class</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId")}
          >
            {classes.map((cls: { id: number; name: string }) => (
              <option value={cls.id.toString()} key={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          {errors.classId && (
            <p className="text-xs text-red-400">{errors.classId.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Teacher</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("teacherId")}
          >
            {teachers.map((teacher: { id: string; firstName: string }) => (
              <option value={teacher.id} key={teacher.id}>
                {teacher.firstName}
              </option>
            ))}
          </select>
          {errors.teacherId && (
            <p className="text-xs text-red-400">{errors.teacherId.message}</p>
          )}
        </div>
      </div>
      {data && <input type="hidden" value={data.id} {...register("id")} />}
      {/* Error Display */}
      {state.error && (
        <div className="mt-4 p-4 border border-red-300 rounded-md bg-red-50">
          <h2 className="text-red-600 font-semibold">Error:</h2>
          {state.message ? (
            <ul className="list-disc list-inside text-red-500">
              <li className="text-sm">{state.message}</li>
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

export default LessonForm;
