import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../input-field";
import SelectField from "../select-field"; // Ensure you have this import
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createClass, updateClass } from "@/actions/class-actions";
import { ClassSchema, classSchema } from "@/schemas/class-schema";
import { useForm } from "react-hook-form";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

const ClassForm = ({
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
  const schema = classSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ClassSchema>({
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
      responseState = await createClass(formData);
    } else {
      responseState = await updateClass(formData);
    }
    setState(responseState);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Class has been ${type === "create" ? "created" : "updated"}!`
      );
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      if (state.messages && state.messages.length) {
        state.messages.forEach((message: string) => toast.error(message));
      } else {
        toast.error(state.message || "Something went wrong!");
      }
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new class" : "Update the class"}
      </h1>

      <span className="text-xs text-gray-400 font-medium">
        Class Information
      </span>
      <div className="flex flex-wrap gap-4">
        <InputField
          label="Class Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
          placeholder="E.g 1A or 1 green"
        />
        <InputField
          label="Capacity"
          name="capacity"
          type="number"
          defaultValue={data?.capacity}
          register={register}
          error={errors?.capacity}
          placeholder="e.g 20"
        />
        {/* Grade SelectField */}
        <SelectField
          label="Grade"
          options={relatedData.grades.map((grade:any) => ({
            value: grade.id,
            label: grade.levelName,
          }))} // Mapping related data for grades
          name="gradeId"
          register={register}
          setValue={setValue}
          error={errors.gradeId}
          defaultValue={data?.gradeId}
        />

        {/* Teacher SelectField */}
        <SelectField
          label="Supervisor"
          options={relatedData.teachers.map((teacher:any) => ({
            value: teacher.id,
            label: `${teacher.firstName} ${teacher.lastName}`,
          }))} // Mapping related data for teachers
          name="supervisorId"
          register={register}
          setValue={setValue}
          error={errors.supervisorId}
          defaultValue={data?.supervisorId}
        />


        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="mt-4 p-4 border border-red-300 rounded-md bg-red-50">
          <h2 className="text-red-600 font-semibold">Error:</h2>
          {state.messages ? (
            <ul className="list-disc list-inside text-red-500">
              {state.messages.map((message, index) => (
                <li key={index} className="text-sm">
                  {message}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-sm">
              {state.message || "Something went wrong!"}
            </span>
          )}
        </div>
      )}

      {/* Submission Button */}
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

export default ClassForm;
