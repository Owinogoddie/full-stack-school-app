// components/FeeTemplateForm.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { FeeTemplateSchema, feeTemplateSchema } from "@/schemas/fee-template-schema";
import InputField from "../input-field";
import SelectField from "../select-field";
import MultiSelect from "../multi-select";
import { createFeeTemplate, updateFeeTemplate } from "@/actions/feetemplate-actions";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
};

type RelatedData = {
  grades: { id: string; levelName: string }[];
  classes: { id: string; name: string; gradeId: string }[];
  academicYears: { id: number; year: string }[];
  terms: { id: string; name: string; academicYearId: number }[];
  feeTypes: { id: string; name: string }[];
  studentCategories: { id: string; name: string }[];
};

const FeeTemplateForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: Partial<FeeTemplateSchema>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData: RelatedData;
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FeeTemplateSchema>({
    resolver: zodResolver(feeTemplateSchema),
    defaultValues: {
      id: data?.id,
      gradeIds: data?.gradeIds || [],
      classIds: data?.classIds || [],
      academicYearId: data?.academicYearId || "",
      termId: data?.termId || "",
      feeTypeId: data?.feeTypeId || "",
      studentCategoryIds: data?.studentCategoryIds || [],
      baseAmount: data?.baseAmount || 0,
    },
  });

  const [state, setState] = useState<ResponseState>({
    success: false,
    error: false,
  });

  const router = useRouter();

  const watchGradeIds = watch("gradeIds");
  const watchAcademicYearId = watch("academicYearId");

  const onSubmit = handleSubmit(async (formData) => {
    let responseState: ResponseState;
    if (type === "create") {
      responseState = await createFeeTemplate(formData);
    } else {
      responseState = await updateFeeTemplate(formData);
    }
    setState(responseState);
  });

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Fee template has been ${type === "create" ? "created" : "updated"}!`
      );
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error(state.message || "Something went wrong!");
    }
  }, [state, router, type, setOpen]);

  const availableClasses = relatedData.classes.filter(
    (classItem) => 
      watchGradeIds.length === 0 || 
      watchGradeIds.includes(classItem.gradeId)
  );

  const filteredTerms = relatedData.terms.filter(
    (term) => term.academicYearId.toString() === watchAcademicYearId
  );
  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new Fee Template" : "Update the Fee Template"}
      </h1>

      <Controller
        name="gradeIds"
        control={control}
        render={({ field }) => (
          <MultiSelect
            label="Grades"
            options={relatedData.grades.map((grade) => ({
              id: grade.id,
              label: grade.levelName,
            }))}
            value={field.value || []}
            onChange={(newValue) => {
              field.onChange(newValue);
              if (newValue.length === relatedData.grades.length) {
                setValue("classIds", []);
              }
            }}
            error={errors.gradeIds}
          />
        )}
      />

      <Controller
        name="classIds"
        control={control}
        render={({ field }) => (
          <MultiSelect
            label="Classes"
            options={availableClasses.map((classItem) => ({
              id: classItem.id,
              label: classItem.name,
            }))}
            value={field.value || []}
            onChange={(newValue) => field.onChange(newValue)}
            error={errors.classIds}
            disabled={watchGradeIds.length === relatedData.grades.length}
          />
        )}
      />

      <SelectField
        label="Academic Year"
        options={relatedData.academicYears.map((year) => ({
          value: year.id.toString(),
          label: year.year,
        }))}
        name="academicYearId"
        register={register}
        setValue={setValue}
        error={errors.academicYearId}
        defaultValue={data?.academicYearId || ""}
      />

      <SelectField
        label="Term"
        options={filteredTerms.map((term) => ({
          value: term.id,
          label: term.name,
        }))}
        name="termId"
        register={register}
        setValue={setValue}
        error={errors.termId}
        defaultValue={data?.termId || ""}
        disabled={!watchAcademicYearId}
      />

      <SelectField
        label="Fee Type"
        options={relatedData.feeTypes.map((feeType) => ({
          value: feeType.id,
          label: feeType.name,
        }))}
        name="feeTypeId"
        register={register}
        setValue={setValue}
        error={errors.feeTypeId}
        defaultValue={data?.feeTypeId || ""}
      />

      <Controller
        name="studentCategoryIds"
        control={control}
        render={({ field }) => (
          <MultiSelect
            label="Student Categories"
            options={relatedData.studentCategories.map((category) => ({
              id: category.id,
              label: category.name,
            }))}
            value={field.value || []}
            onChange={(newValue) => field.onChange(newValue)}
            error={errors.studentCategoryIds}
          />
        )}
      />

      <InputField
        label="Base Amount"
        name="baseAmount"
        register={register}
        error={errors.baseAmount}
        placeholder="Base amount for this fee template"
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

export default FeeTemplateForm;