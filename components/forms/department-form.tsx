import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../input-field";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  createDepartment,
  updateDepartment,
} from "@/actions/department-actions";
import {
  DepartmentSchema,
  departmentSchema,
} from "@/schemas/department-schema";
import { useForm } from "react-hook-form";
import SelectField from "../select-field";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
};

const DepartmentForm = ({
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
  const schema = departmentSchema;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DepartmentSchema>({
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
      // console.log(formData)
      responseState = await createDepartment(formData);
    } else {
      responseState = await updateDepartment(formData);
    }
    setState(responseState);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Department has been ${type === "create" ? "created" : "updated"}!`
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
        {type === "create"
          ? "Create a new Department"
          : "Update the Department"}
      </h1>

      <InputField
        label="Department Name"
        name="name"
        register={register}
        error={errors.name}
        placeholder="e.g., Mathematics Department"
        fullWidth
      />
      <InputField
        label="Description"
        name="description"
        register={register}
        error={errors.description}
        placeholder="Department description"
        fullWidth
        textarea
      />

      <SelectField
        label="Head of department"
        options={relatedData.teachers.map((teacher: any) => ({
          value: teacher.id,
          label: teacher.firstName,
        }))}
        name="headTeacherId"
        register={register}
        setValue={setValue}
        error={errors.headTeacherId}
        defaultValue={data?.headTeacherId}
      />
      {state.error && (
        <div className="mt-4 p-4 border border-red-300 rounded-md bg-red-50">
          <h2 className="text-red-600 font-semibold">Error:</h2>
          {state.message ? (
            <ul className="list-disc list-inside text-red-500">
              
                <li className="text-sm">
                  {state.message}
                </li>
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

export default DepartmentForm;
