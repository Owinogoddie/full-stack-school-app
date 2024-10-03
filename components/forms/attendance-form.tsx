"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../input-field";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AttendanceSchema, attendanceSchema, AttendanceStatus } from "@/schemas/attendance-schema";
import { createAttendance, updateAttendance } from "@/actions/attendance-actions";

const AttendanceForm = ({
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
    formState: { errors },
  } = useForm<AttendanceSchema>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: data,
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAttendance : updateAttendance,
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
      toast(
        `Attendance has been ${type === "create" ? "created" : "updated"}!`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { students, lessons } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new attendance" : "Update the attendance"}
      </h1>
      <InputField
        label="Date"
        name="date"
        type="date"
        register={register}
        error={errors.date}
      />
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-1/2">
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
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <label className="text-xs text-gray-500">Lesson</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("lessonId")}
          >
            {lessons.map((lesson: { id: number; name: string }) => (
              <option value={lesson.id} key={lesson.id}>
                {lesson.name}
              </option>
            ))}
          </select>
          {errors.lessonId && (
            <p className="text-xs text-red-400">{errors.lessonId.message}</p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <label className="text-xs text-gray-500">Status</label>
        <select
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          {...register("status")}
        >
          {Object.values(AttendanceStatus).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        {errors.status && (
          <p className="text-xs text-red-400">{errors.status.message}</p>
        )}
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

export default AttendanceForm;
