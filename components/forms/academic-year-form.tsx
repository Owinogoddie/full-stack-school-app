"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../input-field";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  createAcademicYear,
  updateAcademicYear,
} from "@/actions/academic-year-actions";
import {
  AcademicYearSchema,
  academicYearSchema,
} from "@/schemas/academic-year-schema";
import { useForm, useFieldArray } from "react-hook-form";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

const AcademicYearForm = ({
  type,
  data,
  setOpen,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const schema = academicYearSchema;
  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') {
      return date.split('T')[0];
    }
    return date.toISOString().split('T')[0];
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcademicYearSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...data,
      startDate: data?.startDate ? formatDate(data.startDate) : '',
      endDate: data?.endDate ? formatDate(data.endDate) : '',
      terms: data?.terms?.map((term: any) => ({
        ...term,
        startDate: formatDate(term.startDate),
        endDate: formatDate(term.endDate),
      })) || [{ name: "", startDate: "", endDate: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "terms",
  });

  const [state, setState] = useState<ResponseState>({
    success: false,
    error: false,
  });

  const onSubmit = handleSubmit(async (formData) => {
    let responseState: ResponseState;
    if (type === "create") {
      responseState = await createAcademicYear(formData);
    } else {
      responseState = await updateAcademicYear(formData);
    }
    setState(responseState);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Academic year has been ${type === "create" ? "created" : "updated"}!`
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
        {type === "create"
          ? "Create a new Academic Year"
          : "Update the Academic Year"}
      </h1>

      <InputField
        label="Academic Year"
        name="year"
        register={register}
        error={errors.year}
        placeholder="e.g., 2023-2024"
        fullWidth
      />
      <InputField
        label="Start Date"
        type="date"
        name="startDate"
        register={register}
        error={errors.startDate}
        fullWidth
      />
      <InputField
        label="End Date"
        type="date"
        name="endDate"
        register={register}
        error={errors.endDate}
        fullWidth
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register("currentAcademicYear")}
          id="currentAcademicYear"
        />
        <label htmlFor="currentAcademicYear">Current Academic Year</label>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Terms</h2>
        {fields.map((field, index) => (
          <div key={field.id} className="mb-4 p-4 border rounded">
            <InputField
              label={`Term ${index + 1} Name`}
              name={`terms.${index}.name`}
              register={register}
              error={errors.terms?.[index]?.name}
              fullWidth
            />
            <InputField
              label={`Term ${index + 1} Start Date`}
              type="date"
              name={`terms.${index}.startDate`}
              register={register}
              error={errors.terms?.[index]?.startDate}
              fullWidth
            />
            <InputField
              label={`Term ${index + 1} End Date`}
              type="date"
              name={`terms.${index}.endDate`}
              register={register}
              error={errors.terms?.[index]?.endDate}
              fullWidth
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="mt-2 bg-red-500 text-white p-2 rounded"
            >
              Remove Term
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            append({ name: "", startDate: new Date(), endDate: new Date() })
          }
          className="mt-2 bg-green-500 text-white p-2 rounded"
        >
          Add Term
        </button>
      </div>

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

export default AcademicYearForm;
