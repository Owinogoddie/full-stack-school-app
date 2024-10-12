"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AttendanceSchema>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: data || {
      date: new Date(),
      classId: "",
      students: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "students",
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

  const { students, classes } = relatedData;

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
      <div className="flex flex-col gap-2 w-full">
        <label className="text-xs text-gray-500">Class</label>
        <select
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          {...register("classId")}
        >
          {classes.map((class_: { id: number; name: string }) => (
            <option value={class_.id} key={class_.id}>
              {class_.name}
            </option>
          ))}
        </select>
        {errors.classId && (
          <p className="text-xs text-red-400">{errors.classId.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <label className="text-xs text-gray-500">Students</label>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 items-center">
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm flex-grow"
              {...register(`students.${index}.id`)}
            >
              {students.map((student: { id: string; name: string }) => (
                <option value={student.id} key={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
              {...register(`students.${index}.status`)}
            >
              {Object.values(AttendanceStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => remove(index)}>Remove</button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ id: "", status: AttendanceStatus.PRESENT })}
        >
          Add Student
        </button>
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