import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { StudentCategorySchema, studentCategorySchema } from "@/schemas/student-category-schema";
import InputField from "../input-field";
import { createStudentCategory, updateStudentCategory } from "@/actions/student-category-actions";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
};

const StudentCategoryForm = ({
  type,
  data,
  setOpen,
}: {
  type: "create" | "update";
  data?: Partial<StudentCategorySchema>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentCategorySchema>({
    resolver: zodResolver(studentCategorySchema),
    defaultValues: {
      id: data?.id,
      name: data?.name || "",
      description: data?.description || "",
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
      // Replace with your actual create function
      responseState = await createStudentCategory(formData);
    } else {
      // Replace with your actual update function
      responseState = await updateStudentCategory(formData);
    }
    setState(responseState);
  });

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Student category has been ${type === "create" ? "created" : "updated"}!`
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
        {type === "create" ? "Create a new Student Category" : "Update the Student Category"}
      </h1>

      <InputField
        label="Category Name"
        name="name"
        register={register}
        error={errors.name}
        placeholder="e.g., Boarding"
        fullWidth
      />

      <InputField
        label="Description"
        name="description"
        register={register}
        error={errors.description}
        placeholder="Category description"
        fullWidth
        textarea
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

export default StudentCategoryForm;