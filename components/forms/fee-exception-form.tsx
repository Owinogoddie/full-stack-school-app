"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../input-field";
import SelectField from "../select-field";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  FeeExceptionSchema,
  feeExceptionSchema,
} from "@/schemas/fee-exception-schema";
import {
  createFeeException,
  updateFeeException,
} from "@/actions/fee-exception-actions";
import GlobalDataCheck from "../global-data-check-component";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
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
      feeTemplateId: data?.feeTemplateId,
      studentId: data?.studentId,
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
        `Fee exception has been ${type === "create" ? "created" : "updated"}!`
      );
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      state.messages?.forEach((message: string) => toast.error(message));
    }
  }, [state, router, type, setOpen]);
  console.log(relatedData);
  return (
    <GlobalDataCheck relatedData={relatedData}>
      <form className="flex flex-col gap-8" onSubmit={onSubmit}>
        <h1 className="text-xl font-semibold">
          {type === "create"
            ? "Create a new fee exception"
            : "Update the fee exception"}
        </h1>

        <div className="flex flex-wrap gap-4">
          <SelectField
            label="Fee Template"
            options={relatedData?.feeTemplates?.map((template: any) => ({
              value: template.id,
              label: template.name,
            }))}
            name="feeTemplateId"
            register={register}
            setValue={setValue}
            error={errors.feeTemplateId}
          />
          <SelectField
            label="Student"
            options={relatedData?.students?.map((student: any) => ({
              value: student.id.toString(),
              label: `${student.firstName} ${student.lastName}`,
            }))}
            name="studentId"
            register={register}
            setValue={setValue}
            error={errors.studentId}
          />
          <SelectField
            label="Exception Type"
            options={[
              { value: "DISCOUNT", label: "Discount" },
              { value: "SCHOLARSHIP", label: "Scholarship" },
              { value: "WAIVER", label: "Waiver" },
              { value: "ADJUSTMENT", label: "Adjustment" },
            ]}
            name="type"
            register={register}
            setValue={setValue}
            error={errors.type}
          />
          <SelectField
            label="Adjustment Type"
            options={[
              { value: "PERCENTAGE", label: "Percentage" },
              { value: "FIXED_AMOUNT", label: "Fixed Amount" },
            ]}
            name="adjustmentType"
            register={register}
            setValue={setValue}
            error={errors.adjustmentType}
          />
          <InputField
            label="Adjustment Value"
            name="adjustmentValue"
            type="number"
            register={register}
            error={errors.adjustmentValue}
          />
          <InputField
            label="Reason"
            name="reason"
            register={register}
            error={errors.reason}
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
            label="Status"
            options={[
              { value: "ACTIVE", label: "Active" },
              { value: "EXPIRED", label: "Expired" },
              { value: "CANCELLED", label: "Cancelled" },
            ]}
            name="status"
            register={register}
            setValue={setValue}
            error={errors.status}
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
            "Create Fee Exception"
          ) : (
            "Update Fee Exception"
          )}
        </button>
      </form>
    </GlobalDataCheck>
  );
};

export default FeeExceptionForm;
