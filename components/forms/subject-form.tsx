import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../input-field";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createSubject, updateSubject } from "@/actions/subject-actions";
import { SubjectSchema, subjectSchema } from "@/schemas/subject-schema";
import { useForm } from "react-hook-form";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
};

const SubjectForm = ({
  type,
  data,
  setOpen,
  // relatedData
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?:any
}) => {
  const schema = subjectSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SubjectSchema>({
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
      responseState = await createSubject(formData);
    } else {
      responseState = await updateSubject(formData);
    }
    setState(responseState);
  });

  const router = useRouter();

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