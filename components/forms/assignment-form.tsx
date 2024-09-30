"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../input-field";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AssignmentSchema, assignmentSchema } from "@/schemas/assignment-schema";
import { createAssignment, updateAssignment } from "@/actions/assignment-actions";

const AssignmentForm = ({
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
  } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: data,
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAssignment : updateAssignment,
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
        `Assignment has been ${type === "create" ? "created" : "updated"}!`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { lessons } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new assignment" : "Update the assignment"}
      </h1>
      <InputField
        label="Title"
        name="title"
        register={register}
        error={errors.title}
      />
      <div className="flex flex-wrap gap-4">
        <InputField
          label="Start Date"
          name="startDate"
          type="date"
          register={register}
          error={errors.startDate}
        />
        <InputField
          label="Due Date"
          name="dueDate"
          type="date"
          register={register}
          error={errors.dueDate}
        />
      </div>
      <div className="flex flex-col gap-2 w-full">
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

export default AssignmentForm;
