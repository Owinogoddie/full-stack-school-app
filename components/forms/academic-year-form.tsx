import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../input-field";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createAcademicYear, updateAcademicYear } from "@/actions/academic-year-actions";
import { AcademicYearSchema, academicYearSchema } from "@/schemas/academic-year-schema";
import { useForm } from "react-hook-form";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcademicYearSchema>({
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
      console.log(formData)
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
      toast.error(state.message || "Something went wrong!");
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new Academic Year" : "Update the Academic Year"}
      </h1>

      <InputField
        label="Academic Year"
        name="year"
        register={register}
        error={errors.year}
        placeholder=" e.g., 2023-2024"
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

      <button
        type="submit"
        className="bg-blue-400 text-white p-2 rounded-md"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AcademicYearForm;
