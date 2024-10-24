// FeeExceptionForm.tsx
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
} from "@/actions/fees/fee-exception-actions";
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
  // const [amountType, setAmountType] = useState(data?.amountType || 'FIXED');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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
      amount: data?.amount,
      percentage: data?.percentage,
      amountType: data?.amountType || 'FIXED',
    },
  });

  const currentAmountType = watch('amountType');

  useEffect(() => {
    if (currentAmountType === 'FIXED') {
      setValue('percentage', undefined);
    } else {
      setValue('amount', undefined);
    }
  }, [currentAmountType, setValue]);

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
              { value: "DISABILITY_SUPPORT", label: "Disability support" },
              { value: "FINANCIAL_AID", label: "Financial aid" },
            ]}
            name="exceptionType"
            register={register}
            setValue={setValue}
            error={errors.exceptionType}
          />
          <SelectField
            label="Amount Type"
            options={[
              { value: "FIXED", label: "Fixed Amount" },
              { value: "PERCENTAGE", label: "Percentage" },
            ]}
            name="amountType"
            register={register}
            setValue={setValue}
            error={errors.amountType}
          />
          {currentAmountType === 'FIXED' && (
            <InputField
              label="Amount"
              name="amount"
              type="number"
              register={register}
              error={errors.amount}
            />
          )}
          {currentAmountType === 'PERCENTAGE' && (
            <InputField
              label="Percentage"
              name="percentage"
              type="number"
              register={register}
              error={errors.percentage}
            />
          )}
          <InputField
            label="Description"
            name="description"
            register={register}
            error={errors.description}
          />
          <InputField
            label="Reason"
            name="reason"
            register={register}
            error={errors.reason}
          />
          {/* <InputField
            label="Approved By"
            name="approvedBy"
            register={register}
            error={errors.approvedBy}
          /> */}
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
              { value: "PENDING", label: "Pending" },
              { value: "REJECTED", label: "Rejected" },
              { value: "APPROVED", label: "Approved" },
              { value: "SUSPENDED", label: "Suspended" },
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