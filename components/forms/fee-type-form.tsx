// components/FeeTypeForm.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { FeeTypeSchema, feeTypeSchema } from "@/schemas/fee-type-schema";
import InputField from "../input-field";
import { createFeeType, updateFeeType } from "@/actions/fee-type-actions";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
};

const FeeTypeForm = ({
  type,
  data,
  setOpen,
}: {
  type: "create" | "update";
  data?: Partial<FeeTypeSchema>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FeeTypeSchema>({
    resolver: zodResolver(feeTypeSchema),
    defaultValues: {
      id: data?.id,
      name: data?.name || "",
      description: data?.description || "",
      amount: data?.amount || 0,
    },
  });

  const [state, setState] = useState<ResponseState>({
    success: false,
    error: false,
  });

  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    const submissionData = {
      ...formData,
      amount: Number(formData.amount),
    };
  
    let responseState: ResponseState;
    if (type === "create") {
      responseState = await createFeeType(submissionData);
    } else {
      responseState = await updateFeeType(submissionData);
    }
    setState(responseState);
  });

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Fee type has been ${type === "create" ? "created" : "updated"}!`
      );
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error(state.message || "Something went wrong!");
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new Fee Type" : "Update the Fee Type"}
      </h1>

      <InputField
        label="Fee Type Name"
        name="name"
        register={register}
        error={errors.name}
        placeholder="e.g., Tuition Fee"
        fullWidth
      />

      <InputField
        label="Description"
        name="description"
        register={register}
        error={errors.description}
        placeholder="Fee type description"
        fullWidth
        textarea
      />

      <InputField
        label="Default Amount"
        name="amount"
        register={register}
        error={errors.amount}
        placeholder="Default amount for this fee type"
        fullWidth
        type="number"
      />

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

export default FeeTypeForm;
