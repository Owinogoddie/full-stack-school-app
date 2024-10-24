// components/forms/fee-template-form.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";

import InputField from "../input-field";
import SelectField from "../select-field";
import MultiSelect from "../multi-select";

import { FeeSchema, feeSchema } from "@/schemas/fee-schema";
import { createFee, updateFee } from "@/actions/fees/fee-actions";

// type ResponseState = {
//   success: boolean;
//   error: boolean;
//   message?: string;
// };

type RelatedData = {
  grades: { id: number; levelName: string }[];
  classes: { id: number; name: string; gradeId: string }[];
  academicYears: { id: number; year: string }[];
  terms: { id: string; name: string; academicYearId: number}[];
  // feeTypes: { id: string; name: string; amount: number }[];
  studentCategories: { id: string; name: string }[];
  feeTemplates:{id:string,name:string,baseAmount:number }[],
  specialProgrammes: { 
    id: string; 
    name: string;
    grades: { id: number }[];
    classes: { id: number }[];
  }[];
};

type GradeClassSelection = {
  [gradeId: string]: {
    selected: boolean;
    classes: {
      [classId: string]: boolean;
    };
  };
};

const FeeForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: Partial<FeeSchema>;
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
  } = useForm<FeeSchema>({
    resolver: zodResolver(feeSchema),
    defaultValues: {
      id: data?.id,
      name: data?.name || "",
      description: data?.description || "",
      academicYearId: data?.academicYearId,
      termId: data?.termId || "",
      feeTemplateId: data?.feeTemplateId || "",
      gradeIds: data?.gradeIds || [],
      classIds: data?.classIds || [],
      studentCategoryIds: data?.studentCategoryIds || [],
      specialProgrammeIds: data?.specialProgrammeIds || [],
    //   baseAmount: data?.baseAmount || 0,
    },
  });

//   const [state, setState] = useState<ResponseState>({
//     success: false,
//     error: false,
//   });

  const router = useRouter();
  const watchAcademicYearId = watch("academicYearId");
  const watchFeeTemplateId = watch("feeTemplateId");
  const watchSpecialProgrammeIds = watch("specialProgrammeIds");

  const [gradeClassSelection, setGradeClassSelection] = useState<GradeClassSelection>({});
  const [expandedGrades, setExpandedGrades] = useState<{ [key: string]: boolean }>({});
  const [filteredGradesClasses, setFilteredGradesClasses] = useState<{
    grades: typeof relatedData.grades,
    classes: typeof relatedData.classes
  }>({
    grades: relatedData.grades,
    classes: relatedData.classes
  });

  useEffect(() => {
    if (watchSpecialProgrammeIds?.length) {
      const selectedPrograms = relatedData.specialProgrammes.filter(
        (program) => watchSpecialProgrammeIds.includes(program.id)
      );

      const programGradeIds = new Set(
        selectedPrograms.flatMap(program => program.grades.map(g => g.id))
      );
      const programClassIds = new Set(
        selectedPrograms.flatMap(program => program.classes.map(c => c.id))
      );

      setFilteredGradesClasses({
        grades: relatedData.grades.filter((grade) => programGradeIds.has(grade.id)),
        classes: relatedData.classes.filter((cls) => programClassIds.has(cls.id))
      });
    } else {
      setFilteredGradesClasses({
        grades: relatedData.grades,
        classes: relatedData.classes
      });
    }
  }, [watchSpecialProgrammeIds, relatedData]);

  useEffect(() => {
    const initialSelection: GradeClassSelection = {};
    filteredGradesClasses.grades.forEach((grade) => {
      const gradeId = grade.id.toString();
      initialSelection[gradeId] = {
        selected: data?.gradeIds?.includes(grade.id) || false,
        classes: {},
      };
      filteredGradesClasses.classes
        .filter((cls) => cls.gradeId.toString() === gradeId)
        .forEach((cls) => {
          const classId = cls.id.toString();
          initialSelection[gradeId].classes[classId] = 
            data?.classIds?.includes(classId) || false;
        });
    });
    setGradeClassSelection(initialSelection);
  }, [filteredGradesClasses, data]);

  const toggleGrade = (gradeId: string) => {
    setExpandedGrades(prev => ({
      ...prev,
      [gradeId]: !prev[gradeId]
    }));
  };

  const handleGradeChange = (gradeId: string, isChecked: boolean) => {
    setGradeClassSelection((prev) => {
      const newSelection = { ...prev };
      newSelection[gradeId] = {
        ...newSelection[gradeId],
        selected: isChecked,
        classes: Object.keys(newSelection[gradeId].classes).reduce(
          (acc, classId) => ({
            ...acc,
            [classId]: isChecked, // Automatically select/deselect all classes
          }),
          {}
        ),
      };
      return newSelection;
    });
  };

  const handleClassChange = (gradeId: string, classId: string, isChecked: boolean) => {
    setGradeClassSelection((prev) => {
      const newSelection = { ...prev };
      newSelection[gradeId] = {
        ...newSelection[gradeId],
        classes: {
          ...newSelection[gradeId].classes,
          [classId]: isChecked,
        },
      };
      // Update grade selection based on whether any classes are selected
      newSelection[gradeId].selected = Object.values(newSelection[gradeId].classes).some(Boolean);
      return newSelection;
    });
  };

  // Update form values when grade/class selection changes
  useEffect(() => {
    const selectedGradeIds = Object.entries(gradeClassSelection)
      .filter(([, grade]) => grade.selected)
      .map(([gradeId]) => Number(gradeId));

    const selectedClassIds = Object.entries(gradeClassSelection)
      .flatMap(([, grade]) => 
        Object.entries(grade.classes)
          .filter(([, selected]) => selected)
          .map(([classId]) => classId)
      );

    setValue("gradeIds", selectedGradeIds);
    setValue("classIds", selectedClassIds);
  }, [gradeClassSelection, setValue]);

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const response = type === "create" 
        ? await createFee(formData)
        : await updateFee(formData);

      if (response.success) {
        toast.success(`Fee template ${type === "create" ? "created" : "updated"} successfully`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(response.message || "An error occurred");
      }
    } catch (error) {
        console.log(error)
      toast.error("Failed to submit form");
    }
  });
//   useEffect(() => {
//     if (state.success) {
//       toast.success(
//         `Fee template has been ${type === "create" ? "created" : "updated"}!`
//       );
//       setOpen(false);
//       router.refresh();
//     } else if (state.error) {
//       toast.error(state.message || "Something went wrong!");
//     }
//   }, [state, router, type, setOpen]);
useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Validation errors:", errors);
    }
  }, [errors]);
  useEffect(() => {
    if (watchFeeTemplateId) {
      const selectedFeeTemplate = relatedData.feeTemplates.find(
        (type) => type.id === watchFeeTemplateId
      );
      if (selectedFeeTemplate) {
        setValue("amount", selectedFeeTemplate.baseAmount);
      }
    }
  }, [watchFeeTemplateId, relatedData.feeTemplates, setValue]);
  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new Fee Template" : "Update Fee Template"}
      </h1>

      <InputField
        label="Name"
        name="name"
        register={register}
        error={errors.name}
        placeholder="Enter template name"
      />

      <InputField
        label="Description"
        name="description"
        register={register}
        error={errors.description}
        placeholder="Enter description"
        textarea
      />

      <SelectField
        label="Academic Year"
        options={relatedData.academicYears.map((year) => ({
          value: year.id.toString(),
          label: year.year,
        }))}
        name="academicYearId"
        register={register}
        error={errors.academicYearId}
        setValue={setValue}
      />

      <SelectField
        label="Term"
        options={relatedData.terms
          .filter(term => term.academicYearId === Number(watchAcademicYearId))
          .map((term) => ({
            value: term.id,
            label: term.name,
          }))}
        name="termId"
        register={register}
        error={errors.termId}
        setValue={setValue}
        disabled={!watchAcademicYearId}
      />

      <SelectField
        label="Fee Type"
        options={relatedData.feeTemplates.map((type) => ({
          value: type.id,
          label: type.name,
        }))}
        name="feeTemplateId"
        register={register}
        error={errors.feeTemplateId}
        setValue={setValue}
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

      <Controller
        name="specialProgrammeIds"
        control={control}
        render={({ field }) => (
          <MultiSelect
            label="Special Programmes"
            options={relatedData.specialProgrammes.map((program) => ({
              id: program.id,
              label: program.name,
            }))}
            value={field.value || []}
            onChange={(newValue) => field.onChange(newValue)}
            error={errors.specialProgrammeIds}
          />
        )}
      />

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Grades and Classes</h2>
        <div className="space-y-2">
          {filteredGradesClasses.grades.map((grade) => (
            <div key={grade.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleGrade(grade.id.toString())}
              >
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={gradeClassSelection[grade.id.toString()]?.selected || false}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleGradeChange(grade.id.toString(), e.target.checked);
                    }}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="font-medium text-gray-700">{grade.levelName}</span>
                </label>
                {expandedGrades[grade.id.toString()] ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                )}
              </div>
              {expandedGrades[grade.id.toString()] && (
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {filteredGradesClasses.classes
                      .filter((c) => c.gradeId.toString() === grade.id.toString())
                      .map((classItem) => (
                        <label key={classItem.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={gradeClassSelection[grade.id.toString()]?.classes[classItem.id.toString()] || false}
                            onChange={(e) =>
                              handleClassChange(grade.id.toString(), classItem.id.toString(), e.target.checked)
                            }
                            className="form-checkbox h-4 w-4 text-blue-600"
                          />
                          <span className="text-sm text-gray-600">{classItem.name}</span>
                        </label>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <InputField
        label="Amount"
        name="amount"
        type="number"
        register={register}
        error={errors.amount}
        placeholder="Enter base amount"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
          </div>
        ) : type === "create" ? (
          "Create Template"
        ) : (
          "Update Template"
        )}
      </button>
    </form>
  );
};

export default FeeForm;