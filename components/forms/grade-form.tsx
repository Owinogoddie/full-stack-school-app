"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../input-field";
import SelectField from "../select-field";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createGrade, updateGrade } from "@/actions/grade-actions";
import { GradeSchema, gradeSchema } from "@/schemas/grade-schema";
import {
  formattedGradeLevelOptions,
  formattedStageOptions,
} from "@/lib/grade-enums";
import { useForm } from "react-hook-form";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

const GradeForm = ({
  type,
  data,
  setOpen,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const schema = type === "create" ? gradeSchema : gradeSchema;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GradeSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...data,
    },
  });

  const [state, setState] = useState<ResponseState>({
    success: false,
    error: false,
  });

  const onSubmit = handleSubmit(async (formData) => {
    let responseState: ResponseState;
    if (type === "create") {
      responseState = await createGrade(formData);
    } else {
      responseState = await updateGrade(formData);
    }
    setState(responseState);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Grade has been ${type === "create" ? "created" : "updated"}!`
      );
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      if (state.messages && state.messages.length) {
        state.messages.forEach((message: string) => toast.error(message));
      } else {
        toast.error(state.message || "Something went wrong!");
      }
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new grade" : "Update the grade"}
      </h1>

      {/* Authentication Information */}
      <span className="text-xs text-gray-400 font-medium">
        Grade Information
      </span>
      <div className="flex flex-wrap gap-4">
        <SelectField
          label="Grade Level"
          options={formattedGradeLevelOptions}
          name="levelName"
          register={register}
          setValue={setValue}
          error={errors.levelName}
          defaultValue={data?.levelName}
        />
        <SelectField
          label="Stage"
          options={formattedStageOptions}
          name="stage"
          register={register}
          setValue={setValue}
          error={errors.stage}
          defaultValue={data?.stage}
        />
        
        <InputField
          label="Description"
          name="description"
          defaultValue={data?.description}
          register={register}
          error={errors?.description}
          fullWidth
          placeholder="A short description e.g grade 1 juniors pre primary"
        />
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
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
      {/* Submission Button */}
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

export default GradeForm;
