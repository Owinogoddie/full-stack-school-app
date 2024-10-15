import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { TermSchema, termSchema } from "@/schemas/term-schema";
import InputField from "../input-field";
import SelectField from "../select-field";
import { createTerm, updateTerm } from "@/actions/term-actions";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
};

const TermForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: Partial<TermSchema>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<TermSchema>({
    resolver: zodResolver(termSchema),
    defaultValues: {
      id: data?.id,
      name: data?.name || "",
      startDate: data?.startDate ? new Date(data.startDate) : undefined,
      endDate: data?.endDate ? new Date(data.endDate) : undefined,
      academicYearId: data?.academicYearId,
    },
  });

  const [state, setState] = useState<ResponseState>({
    success: false,
    error: false,
  });

  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    let responseState: ResponseState;
    if (type === "create") {
      responseState = await createTerm(formData);
    } else {
      responseState = await updateTerm(formData);
    }
    setState(responseState);
  });

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Term has been ${type === "create" ? "created" : "updated"}!`
      );
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error(state.message || "Something went wrong!");
    }
  }, [state, router, type, setOpen]);
console.log(relatedData)
  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new Term" : "Update the Term"}
      </h1>

      <InputField
        label="Term Name"
        name="name"
        register={register}
        error={errors.name}
        placeholder="e.g., First Term"
        fullWidth
      />

      <InputField
        label="Start Date"
        name="startDate"
        register={register}
        error={errors.startDate}
        type="date"
        fullWidth
      />

      <InputField
        label="End Date"
        name="endDate"
        register={register}
        error={errors.endDate}
        type="date"
        fullWidth
      />

      <SelectField
        label="Academic Year"
        options={relatedData.academicYears.map((year: any) => ({
          value: year.id.toString(),
          label: year.year,
        }))}
        name="academicYearId"
        register={register}
        setValue={setValue}
        error={errors.academicYearId}
        defaultValue={data?.academicYearId?.toString() || ""}
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

export default TermForm;