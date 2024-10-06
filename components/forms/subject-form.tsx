// components/SubjectForm.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../input-field";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createSubject, updateSubject } from "@/actions/subject-actions";
import { SubjectSchema, subjectSchema } from "@/schemas/subject-schema";
import { useForm, Controller } from "react-hook-form";
import SelectField from "../select-field";
import MultiSelect from "../multi-select";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
};
const SubjectForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: Partial<SubjectSchema>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData:any
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<SubjectSchema>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      id: data?.id,
      name: data?.name || "",
      code: data?.code || "",
      description: data?.description || "",
      parentId: data?.parentId || null,
      teacherIds: data?.teacherIds || [],
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
      responseState = await createSubject(formData);
    } else {
      responseState = await updateSubject(formData);
    }
    setState(responseState);
  });

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Validation errors:", errors);
    }
  }, [errors]);

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Subject has been ${type === "create" ? "created" : "updated"}!`
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
        {type === "create" ? "Create a new Subject" : "Update the Subject"}
      </h1>

      <InputField
        label="Subject Name"
        name="name"
        register={register}
        error={errors.name}
        placeholder="e.g., Mathematics"
        fullWidth
      />

      <InputField
        label="Subject Code"
        name="code"
        register={register}
        error={errors.code}
        placeholder="e.g., MATH101"
        fullWidth
      />

      <InputField
        label="Description"
        name="description"
        register={register}
        error={errors.description}
        placeholder="Subject description"
        fullWidth
        textarea
      />
    <SelectField
            label="Parent Subject"
            options={relatedData?.allSubjects?.map((subject: any) => ({
              value: subject.id.toString(),
              label: subject.name,
            }))}
            name="parentId"
            register={register}
            setValue={setValue}
            error={errors.parentId}
            defaultValue={data?.parentId?.toString() ||""}
          />
     

      <Controller
        name="teacherIds"
        control={control}
        render={({ field }) => (
          <MultiSelect
            label="Teachers"
            options={relatedData.teachers.map((teacher:any) => ({
              id: teacher.id.toString(),
              label: teacher.firstName,
            }))}
            value={field.value || []}
            onChange={(newValue) => field.onChange(newValue)}
            error={errors.teacherIds}
          />
        )}
      />

      {/* Error Display */}
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

export default SubjectForm;