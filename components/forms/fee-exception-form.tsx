"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import InputField from "../input-field";
import SelectField from "../select-field";
import {
  FeeExceptionSchema,
  feeExceptionSchema,
} from "@/schemas/fee-exception-schema";
import {
  createFeeException,
  updateFeeException,
} from "@/actions/fees/fee-exception-actions";
import GlobalDataCheck from "../global-data-check-component";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
};

const FeeExceptionForm = ({
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
  } = useForm<FeeExceptionSchema>({
    resolver: zodResolver(feeExceptionSchema),
    defaultValues: {
      ...data,
      startDate: data?.startDate
        ? new Date(data.startDate).toISOString().split("T")[0]
        : undefined,
      endDate: data?.endDate
        ? new Date(data.endDate).toISOString().split("T")[0]
        : undefined,
      amount: data?.amount || 0,
      isActive: data?.isActive ?? true,
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
      responseState = await createFeeException(formData);
    } else {
      responseState = await updateFeeException({
        ...formData,
        id: data?.id,
      });
    }
    setState(responseState);
  });

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Fee exception ${type === "create" ? "created" : "updated"} successfully`
      );
      setOpen(false);
      router.refresh();
    } else if (state.error && state.message) {
      toast.error(state.message);
    }
  }, [state, router, type, setOpen]);

  return (
    <GlobalDataCheck relatedData={relatedData}>
      <form className="flex flex-col gap-8" onSubmit={onSubmit}>
        <h1 className="text-xl font-semibold">
          {type === "create" ? "Create Fee Exception" : "Update Fee Exception"}
        </h1>

        <div className="flex flex-wrap gap-4">
          {/* Student */}
          <SelectField
            label="Student"
            options={
              relatedData?.students?.map((student: any) => ({
                value: student.id.toString(),
                label: `${student.firstName} ${student.lastName}`,
              })) || []
            }
            name="studentId"
            register={register}
            setValue={setValue}
            error={errors.studentId}
          />

          {/* Fee Structure */}
          <SelectField
            label="Fee Structure"
            options={
              relatedData?.feeStructures?.map((structure: any) => ({
                value: structure.id.toString(),
                label: structure.name,
              })) || []
            }
            name="feeStructureId"
            register={register}
            setValue={setValue}
            error={errors.feeStructureId}
          />

          {/* Amount */}
          <InputField
            label="Amount"
            name="amount"
            type="number"
            register={register}
            error={errors.amount}
          />

          {/* Reason */}
          <InputField
            label="Reason"
            name="reason"
            register={register}
            error={errors.reason}
          />

          {/* Start Date */}
          <InputField
            label="Start Date"
            name="startDate"
            type="date"
            register={register}
            error={errors.startDate}
          />

          {/* End Date */}
          <InputField
            label="End Date"
            name="endDate"
            type="date"
            register={register}
            error={errors.endDate}
          />

          {/* Is Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("isActive")}
              id="isActive"
              className="h-4 w-4"
            />
            <label htmlFor="isActive">Active</label>
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
            </div>
          ) : (
            `${type === "create" ? "Create" : "Update"} Fee Exception`
          )}
        </button>
      </form>
    </GlobalDataCheck>
  );
};

export default FeeExceptionForm;
