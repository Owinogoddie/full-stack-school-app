import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../input-field";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createSubject, updateSubject, getSubjects } from "@/actions/subject-actions";
import { SubjectSchema, subjectSchema } from "@/schemas/subject-schema";
import { useForm, Controller } from "react-hook-form";
import SelectField from "../select-field";
import MultiSelect from "../multi-select";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
};

interface Subject {
  id: number;
  name: string;
  code: string;
  description: string | null;
  parentId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectForm = ({
  type,
  data,
  setOpen,
}: {
  type: "create" | "update";
  data?: Partial<SubjectSchema>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm<SubjectSchema>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      id: data?.id,
      name: data?.name || "",
      code: data?.code || "",
      description: data?.description || "",
      parentId: data?.parentId || null,
      relatedSubjects: data?.relatedSubjects || [],
    },
  });
  
  const parentId = watch('parentId');
  const [state, setState] = useState<ResponseState>({
    success: false,
    error: false,
  });

  const router = useRouter();

  useEffect(() => {
    const fetchSubjects = async () => {
      const fetchedSubjects = await getSubjects();
      setSubjects(fetchedSubjects);
    };
    fetchSubjects();
  }, []);

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
        options={[
          { value: '', label: 'None' },
          ...subjects.map((subject) => ({
            value: subject.id.toString(),
            label: subject.name,
          }))
        ]}
        name="parentId"
        register={register}
        setValue={setValue}
        error={errors.parentId}
        defaultValue={parentId ? parentId.toString() : ''}
      />

      <Controller
        name="relatedSubjects"
        control={control}
        render={({ field }) => (
          <MultiSelect
            label="Related Subjects"
            options={subjects.map((subject) => ({
              id: subject.id.toString(),
              label: subject.name,
            }))}
            value={field.value || []}
            onChange={(newValue) => {
              field.onChange(newValue);
            }}
            error={errors.relatedSubjects}
          />
        )}
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

export default SubjectForm;