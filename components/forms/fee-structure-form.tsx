// components/forms/fee-structure-form.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";

import InputField from "../input-field";
import SelectField from "../select-field";
import MultiSelect from "../multi-select";

import { FeeStructureSchema, feeStructureSchema } from "@/schemas/fee-structure-schema";
import { createFeeStructure, updateFeeStructure } from "@/actions/fees/fee-structure";

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
      [classId: number]: boolean;
    };
  };
};

const FeeStructureForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
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
  } = useForm<FeeStructureSchema>({
    resolver: zodResolver(feeStructureSchema),
    defaultValues: {
      id: data?.id,
      feeTypeId: data?.feeType?.id || data?.feeTypeId || "",
      categoryIds: data?.categories?.map((cat:any) => cat.id) || [],
      gradeIds: data?.grades?.map((grade:any) => grade.id) || [],
      classIds: data?.classes?.map((cls:any) => cls.id) || [],
      amount: data?.amount || 0,
      frequency: data?.frequency || "",
      academicYearId: data?.academicYear?.id || data?.academicYearId,
      termId: data?.term?.id || data?.termId || null,
      dueDate: data?.dueDate ? new Date(data.dueDate) : new Date(),
      specialProgrammes: data?.specialProgrammes?.map((prog:any) => prog.id) || [],
      isActive: data?.isActive ?? true,
    },
  });
// console.log(data)
  const router = useRouter();
  const watchAcademicYearId = watch("academicYearId");
  const watchSpecialProgrammes = watch("specialProgrammes");
  const watchFeeTypeId = watch("feeTypeId");

  const [expandedGrades, setExpandedGrades] = useState<{ [key: string]: boolean }>({});
  const [gradeClassSelection, setGradeClassSelection] = useState<GradeClassSelection>({});
  const [filteredGradesClasses, setFilteredGradesClasses] = useState<{
    grades: typeof relatedData.grades,
    classes: typeof relatedData.classes
  }>({
    grades: relatedData.grades,
    classes: relatedData.classes
  });

  useEffect(() => {
    if (watchSpecialProgrammes?.length) {
      const selectedPrograms = relatedData.specialProgrammes.filter(
        (program) => watchSpecialProgrammes.includes(program.id)
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
  }, [watchSpecialProgrammes, relatedData]);

  useEffect(() => {
    if (watchFeeTypeId) {
      const selectedType = relatedData.feeTypes.find(
        (type) => type.id === watchFeeTypeId
      );
      if (selectedType) {
        setValue("amount", selectedType.amount);
      }
    }
  }, [watchFeeTypeId, relatedData.feeTypes, setValue]);

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
          initialSelection[gradeId].classes[cls.id] = 
            data?.classIds?.includes(cls.id) || false;
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

  const handleClassChange = (gradeId: string, classId: number, isChecked: boolean) => {
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
  }

  useEffect(() => {
    const selectedGradeIds = Object.entries(gradeClassSelection)
      .filter(([, grade]) => grade.selected)
      .map(([gradeId]) => Number(gradeId));
  
    const selectedClassIds = Object.entries(gradeClassSelection)
      .flatMap(([, grade]) => 
        Object.entries(grade.classes)
          .filter(([, selected]) => selected)
          .map(([classId]) => Number(classId))
      );
  
    setValue("gradeIds", selectedGradeIds);
    setValue("classIds", selectedClassIds);
  }, [gradeClassSelection, setValue]);

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const response = type === "create" 
        ? await createFeeStructure(formData)
        : await updateFeeStructure(formData);

      if (response.success) {
        toast.success(`Fee structure ${type === "create" ? "created" : "updated"} successfully`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(response.message || "An error occurred");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to submit form");
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create Fee Structure" : "Update Fee Structure"}
      </h1>

      <SelectField
        label="Fee Type"
        options={relatedData.feeTypes.map((type) => ({
          value: type.id,
          label: type.name,
        }))}
        name="feeTypeId"
        register={register}
        error={errors.feeTypeId}
        setValue={setValue}
      />

      <Controller
        name="categoryIds"
        control={control}
        render={({ field }) => (
          <MultiSelect
            label="Categories"
            options={relatedData.studentCategories.map((category) => ({
              id: category.id,
              label: category.name,
            }))}
            value={field.value || []}
            onChange={(newValue) => field.onChange(newValue)}
            error={errors.categoryIds}
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
                            checked={gradeClassSelection[grade.id.toString()]?.classes[classItem.id] || false}
                            onChange={(e) =>
                              handleClassChange(grade.id.toString(), classItem.id, e.target.checked)
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

      <InputField
        label="Amount"
        name="amount"
        type="number"
        register={register}
        error={errors.amount}
        placeholder="Enter amount"
      />

      <InputField
        label="Frequency"
        name="frequency"
        register={register}
        error={errors.frequency}
        placeholder="Enter frequency"
      />

<InputField
  label="Due Date"
  name="dueDate"
  type="date"
  register={register}
  error={errors.dueDate}
  defaultValue={data?.dueDate 
    ? new Date(data.dueDate).toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0]
  }
/>

      <Controller
        name="specialProgrammes"
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
            error={errors.specialProgrammes}
          />
        )}
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register("isActive")}
          className="form-checkbox h-5 w-5"
        />
        <label>Active</label>
      </div>

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
          "Create Fee Structure"
        ) : (
          "Update Fee Structure"
        )}
      </button>
    </form>
  );
};

export default FeeStructureForm;