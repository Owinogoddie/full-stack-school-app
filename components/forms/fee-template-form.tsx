import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import {
  FeeTemplateSchema,
  feeTemplateSchema,
} from "@/schemas/fee-template-schema";
import InputField from "../input-field";
import SelectField from "../select-field";
import MultiSelect from "../multi-select";
import {
  createFeeTemplate,
  updateFeeTemplate,
} from "@/actions/feetemplate-actions";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
};

type RelatedData = {
  grades: { id: number; levelName: string }[];
  classes: { id: number; name: string; gradeId: string }[];
  academicYears: { id: number; year: string }[];
  terms: { id: string; name: string; academicYearId: number }[];
  feeTypes: { id: string; name: string; amount: number }[];
  studentCategories: { id: string; name: string }[];
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
      academicYearId: data?.academicYearId || undefined,
      termId: data?.termId || "",
      feeTypeId: data?.feeTypeId || "",
      studentCategoryIds: data?.studentCategoryIds || [],
      baseAmount: data?.baseAmount || 0,
      gradeClasses: data?.gradeClasses || [],
      specialProgrammeId: data?.specialProgrammeId || "",
    },
  });

  const [state, setState] = useState<ResponseState>({
    success: false,
    error: false,
  });

  const router = useRouter();
  const watchAcademicYearId = watch("academicYearId");
  const watchFeeTypeId = watch("feeTypeId");
  const watchSpecialProgrammeId = watch("specialProgrammeId");

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
    if (watchSpecialProgrammeId) {
      const selectedProgram = relatedData.specialProgrammes.find(
        (program) => program.id === watchSpecialProgrammeId
      );

      if (selectedProgram) {
        const programGradeIds = selectedProgram.grades.map(g => g.id);
        const programClassIds = selectedProgram.classes.map(c => c.id);

        setFilteredGradesClasses({
          grades: relatedData.grades.filter((grade) => programGradeIds.includes(grade.id)),
          classes: relatedData.classes.filter((cls) => programClassIds.includes(cls.id))
        });
      }
    } else {
      setFilteredGradesClasses({
        grades: relatedData.grades,
        classes: relatedData.classes
      });
    }
  }, [watchSpecialProgrammeId, relatedData]);

  useEffect(() => {
    const initialSelection: GradeClassSelection = {};
    filteredGradesClasses.grades.forEach((grade) => {
      const gradeId = grade.id.toString();
      const existingGradeClasses = data?.gradeClasses?.find(gc => gc.gradeId === gradeId);
      initialSelection[gradeId] = {
        selected: !!existingGradeClasses,
        classes: {},
      };
      filteredGradesClasses.classes
        .filter((cls) => cls.gradeId.toString() === gradeId)
        .forEach((cls) => {
          const classId = cls.id.toString();
          initialSelection[gradeId].classes[classId] = 
            existingGradeClasses?.classes.includes(classId) || false;
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
            [classId]: isChecked,
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
      newSelection[gradeId].selected = Object.values(newSelection[gradeId].classes).some(Boolean);
      return newSelection;
    });
  };

  useEffect(() => {
    const gradeClasses = Object.entries(gradeClassSelection)
      .filter(([, grade]) => grade.selected)
      .map(([gradeId, grade]) => ({
        gradeId,
        classes: Object.entries(grade.classes)
          .filter(([, selected]) => selected)
          .map(([classId,]) => classId)
      }))
      .filter(gc => gc.classes.length > 0);
    
    setValue("gradeClasses", gradeClasses);
  }, [gradeClassSelection, setValue]);

  const onSubmit = handleSubmit(async (formData) => {
    const transformedData = {
      ...formData,
      baseAmount: parseFloat(formData.baseAmount as unknown as string) || 0,
    };

    let responseState: ResponseState;
    if (type === "create") {
      responseState = await createFeeTemplate(transformedData);
    } else {
      responseState = await updateFeeTemplate(transformedData);
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

  useEffect(() => {
    if (watchFeeTypeId) {
      const selectedFeeType = relatedData.feeTypes.find(
        (feeType) => feeType.id === watchFeeTypeId
      );
      if (selectedFeeType && typeof selectedFeeType.amount === 'number') {
        setValue("baseAmount", selectedFeeType.amount);
      }
    }
  }, [watchFeeTypeId, relatedData.feeTypes, setValue]);

  const filteredTerms = relatedData.terms.filter(
    (term) => term.academicYearId === Number(watchAcademicYearId)
  );

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new Fee Template" : "Update the Fee Template"}
      </h1>

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
        defaultValue={data?.academicYearId?.toString() || ""}
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

      <SelectField
        label="Specialized Programme"
        options={relatedData.specialProgrammes.map((program) => ({
          value: program.id,
          label: program.name,
        }))}
        name="specialProgrammeId"
        register={register}
        setValue={setValue}
        error={errors.specialProgrammeId}
        defaultValue={data?.specialProgrammeId || ""}
      />

      {watchSpecialProgrammeId && (
        <div className="bg-blue-100 p-4 rounded-md">
          <p className="text-blue-800">
            You have selected a special programme. Only grades and classes associated with this programme will be available for selection.
          </p>
        </div>
      )}

      {!watchSpecialProgrammeId && (
        <div className="bg-yellow-100 p-4 rounded-md">
          <p className="text-yellow-800">
            No special programme selected. All grades and classes are available for selection.
          </p>
        </div>
      )}

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
                    className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition duration-150 ease-in-out"
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
                        <label key={classItem.id} className="flex items-center space-x-2 bg-white rounded-md p-2 hover:bg-gray-100 transition-colors duration-200">
                          <input
                            type="checkbox"
                            checked={gradeClassSelection[grade.id.toString()]?.classes[classItem.id.toString()] || false}
                            onChange={(e) =>
                              handleClassChange(grade.id.toString(), classItem.id.toString(), e.target.checked)
                            }
                            className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition duration-150 ease-in-out"
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