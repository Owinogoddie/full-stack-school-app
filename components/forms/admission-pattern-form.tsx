"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createAdmissionPattern, updateAdmissionPattern } from "@/actions/admission-pattern-actions";
import { generateAdmissionNumber } from "@/utils/generate-admission-number";
import InputField from "../input-field";
import SelectField from "../select-field";
import { AdmissionNumberPatternSchema } from "@/schemas/admission-pattern-schema";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
};

const AdmissionPatternForm = ({
  type,
  data,
  setOpen,
  schoolId,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: (open: boolean) => void;
  schoolId?: string;
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AdmissionNumberPatternSchema>({
    resolver: zodResolver(AdmissionNumberPatternSchema),
    defaultValues: {
      ...data,
      schoolId: schoolId,
    },
  });

  const router = useRouter();
  const [state, setState] = useState<ResponseState>({
    success: false,
    error: false,
  });

  // Watch form fields for preview
  const prefix = watch("prefix");
  const yearFormat = watch("yearFormat");
  const digitCount = watch("digitCount");
  const separator = watch("separator");
  const lastNumber = watch("lastNumber");

  // Generate preview whenever form fields change
  const previewNumber = prefix && yearFormat && digitCount
    ? generateAdmissionNumber({
        prefix,
        yearFormat,
        digitCount,
        separator:separator || "",
        lastNumber: lastNumber || 0,
      })
    : "";

  const onSubmit = handleSubmit(async (formData) => {
    let responseState: ResponseState;
    if (type === "create") {
      responseState = await createAdmissionPattern(formData);
    } else {
      responseState = await updateAdmissionPattern(formData);
    }
    setState(responseState);
  });

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Success!");
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error(state.message || "An error occurred");
    }
  }, [state, router, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create Admission Number Pattern" : "Update Admission Number Pattern"}
      </h1>

      <div className="flex flex-wrap gap-4">
        <InputField
          label="Prefix"
          name="prefix"
          register={register}
          error={errors.prefix}
          placeholder="e.g., ADM"
          fullWidth
        />

        <SelectField
          setValue={setValue}
          label="Year Format"
          name="yearFormat"
          register={register}
          error={errors.yearFormat}
          options={[
            { value: "YY", label: "Two digits (YY)" },
            { value: "YYYY", label: "Four digits (YYYY)" },
          ]}
        />

        <InputField
          label="Number of Digits"
          name="digitCount"
          type="number"
          register={register}
          error={errors.digitCount}
          placeholder="e.g., 4"
        />

        <InputField
          label="Separator (Optional)"
          name="separator"
          register={register}
          error={errors.separator}
          placeholder="e.g., /"
        />

        <InputField
          label="Last Used Number"
          name="lastNumber"
          type="number"
          register={register}
          error={errors.lastNumber}
          placeholder="e.g., 0"
          fullWidth
        />
      </div>

      {previewNumber && (
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-500">Preview:</p>
          <p className="text-lg font-mono">{previewNumber}</p>
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
          "Create Pattern"
        ) : (
          "Update Pattern"
        )}
      </button>
    </form>
  );
};

export default AdmissionPatternForm;