// components/FeeTemplateForm.tsx
"use client";

import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FeeTemplateSchema, feeTemplateSchema } from "@/schemas/fee-template-schema";
import InputField from "../input-field";
import SelectField from "../select-field";
import {
  createFeeTemplate,
  updateFeeTemplate,
} from "@/actions/fees/fee-template-actions";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
};

type RelatedData = {
  academicYears: { id: number; year: string }[];
  terms: { id: string; name: string; academicYearId: number }[];
  feeTypes: { id: string; name: string; amount: number }[];
};

interface FeeTemplateFormProps {
  type: "create" | "update";
  data?: Partial<FeeTemplateSchema>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData: RelatedData;
}

const FeeTemplateForm: React.FC<FeeTemplateFormProps> = ({
  type,
  data,
  setOpen,
  relatedData,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FeeTemplateSchema>({
    resolver: zodResolver(feeTemplateSchema),
    defaultValues: {
      id: data?.id,
      schoolId: data?.schoolId,
      academicYearId: data?.academicYearId || undefined,
      termId: data?.termId || "",
      feeTypeId: data?.feeTypeId || "",
      baseAmount: data?.baseAmount || 0,
      version: data?.version || 1,
      isActive: data?.isActive ?? true,
    },
  });

  const [state, setState] = useState<ResponseState>({
    success: false,
    error: false,
  });

  const router = useRouter();
  const watchAcademicYearId = watch("academicYearId");
  const watchFeeTypeId = watch("feeTypeId");

  useEffect(() => {
    if (watchFeeTypeId) {
      const selectedFeeType = relatedData.feeTypes.find(
        (feeType) => feeType.id === watchFeeTypeId
      );
      if (selectedFeeType && typeof selectedFeeType.amount === 'number') {
        setValue("baseAmount", selectedFeeType.amount);
      }
    }
  }, [watchFeeTypeId, relatedData.feeTypes, setValue]);

  const onSubmit = handleSubmit(async (formData) => {
    const transformedData = {
      ...formData,
      baseAmount: parseFloat(formData.baseAmount as unknown as string) || 0,
    };

    let responseState: ResponseState;
    if (type === "create") {
      responseState = await createFeeTemplate(transformedData);
    } else {
      responseState = await updateFeeTemplate(transformedData);
    }
    setState(responseState);
  });

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Fee template has been ${type === "create" ? "created" : "updated"}!`
      );
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error(state.message || "Something went wrong!");
    }
  }, [state, router, type, setOpen]);

  const filteredTerms = relatedData.terms.filter(
    (term) => term.academicYearId === Number(watchAcademicYearId)
  );

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new Fee Template" : "Update the Fee Template"}
      </h1>

      <SelectField
        label="Academic Year"
        options={relatedData.academicYears.map((year) => ({
          value: year.id.toString(),
          label: year.year,
        }))}
        name="academicYearId"
        register={register}
        setValue={setValue}
        error={errors.academicYearId}
        defaultValue={data?.academicYearId?.toString() || ""}
      />

      <SelectField
        label="Term"
        options={filteredTerms.map((term) => ({
          value: term.id,
          label: term.name,
        }))}
        name="termId"
        register={register}
        setValue={setValue}
        error={errors.termId}
        defaultValue={data?.termId || ""}
        disabled={!watchAcademicYearId}
      />

      <SelectField
        label="Fee Type"
        options={relatedData.feeTypes.map((feeType) => ({
          value: feeType.id,
          label: feeType.name,
        }))}
        name="feeTypeId"
        register={register}
        setValue={setValue}
        error={errors.feeTypeId}
        defaultValue={data?.feeTypeId || ""}
      />

      <InputField
        label="Base Amount"
        name="baseAmount"
        register={register}
        error={errors.baseAmount}
        placeholder="Base amount for this fee template"
        fullWidth
        type="number"
      />

      {type === "update" && (
        <div className="flex items-center gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register("isActive")}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <span>Active</span>
          </label>
          <div className="text-sm text-gray-600">
            Version: {watch("version")}
          </div>
        </div>
      )}

      {state.error && (
        <div className="mt-4 p-4 border border-red-300 rounded-md bg-red-50">
          <h2 className="text-red-600 font-semibold">Error:</h2>
          <span className="text-sm">
            {state.message || "Something went wrong!"}
          </span>
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

export default FeeTemplateForm;