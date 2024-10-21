// components/special-programme-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  SpecialProgrammeSchema,
  specialProgrammeSchema,
} from "@/schemas/special-programme-schema";
import {
  createSpecialProgramme,
  updateSpecialProgramme,
} from "@/actions/special-programme-actions";
import InputField from "../input-field";
import MultiSelect from "../multi-select";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

const SpecialProgrammeForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: any;
  relatedData?: any;
}) => {

  const [filteredClasses, setFilteredClasses] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [selectedGradeInfo, setSelectedGradeInfo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SpecialProgrammeSchema>({
    resolver: zodResolver(specialProgrammeSchema),
    defaultValues: {
      ...data,
      grades: data?.grades?.map((grade: any) => grade.id) || [],
      classes: data?.classes?.map((cls: any) => cls.id) || [],
      students: data?.students?.map((student: any) => student.id) || [],
    },
  });

  const selectedGrades = watch("grades");
  const selectedClasses = watch("classes");
  // Effect to handle grade selection
  useEffect(() => {
    if (!relatedData) return;

    const { grades, classes,} = relatedData;

    if (selectedGrades && selectedGrades.length > 0) {
      // Filter classes belonging to selected grades
      const relevantClasses = classes.filter((cls: any) =>
        selectedGrades.includes(cls.gradeId)
      );
      setFilteredClasses(relevantClasses);

      // Automatically select all classes of selected grades
      const classIds = relevantClasses.map((cls: any) => cls.id);
      setValue("classes", classIds);

      // Update grade info for display
      const gradeNames = selectedGrades
        .map((gradeId: number) => {
          const grade = grades.find((g: any) => g.id === gradeId);
          return grade?.levelName;
        })
        .filter(Boolean)
        .join(", ");
      setSelectedGradeInfo(`Selected Grade(s): ${gradeNames}`);
    } else {
      setFilteredClasses([]);
      setValue("classes", []);
      setSelectedGradeInfo(null);
    }
  }, [selectedGrades, relatedData, setValue]);

  // Effect to handle class selection
  useEffect(() => {
    if (!relatedData) return;

    const { students } = relatedData;

    if (selectedClasses && selectedClasses.length > 0) {
      // Filter students belonging to selected classes
      const relevantStudents = students.filter((student: any) =>
        selectedClasses.includes(student.classId)
      );
      setFilteredStudents(relevantStudents);

      // Automatically select all students of selected classes
      const studentIds = relevantStudents.map((student: any) => student.id);
      setValue("students", studentIds);
    } else {
      setFilteredStudents([]);
      setValue("students", []);
    }
  }, [selectedClasses, relatedData, setValue]);

  const [state, setState] = useState<ResponseState>({
    success: false,
    error: false,
  });

  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    let responseState: ResponseState;
    if (type === "create") {
      responseState = await createSpecialProgramme(formData);
    } else {
      responseState = await updateSpecialProgramme(formData);
    }
    setState(responseState);
  });

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Special programme has been ${
          type === "create" ? "created" : "updated"
        }!`
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

  // const { grades, classes, students } = relatedData || {};
  // console.log(relatedData)
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Validation errors:", errors);
    }
  }, [errors]);
  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Create a new special programme"
          : "Update the special programme"}
      </h1>

      {selectedGradeInfo && (
        <div className="text-sm text-blue-600">{selectedGradeInfo}</div>
      )}

      <div className="flex flex-wrap gap-4">
        <InputField
          label="Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
          placeholder="Enter programme name"
          fullWidth
        />

        <InputField
          label="Description"
          name="description"
          defaultValue={data?.description}
          register={register}
          error={errors.description}
          placeholder="Enter description"
          fullWidth
        />

        <Controller
          name="grades"
          control={control}
          render={({ field }) => (
            <MultiSelect
              label="Grades"
              options={relatedData?.grades?.map((grade: any) => ({
                id: grade.id.toString(),
                label: grade.levelName,
              }))}
              value={field.value?.map((v) => v.toString()) || []}
              onChange={(newValue) => field.onChange(newValue.map(v => parseInt(v, 10)))}
              error={errors.grades}
            />
          )}
        />

        <Controller
          name="classes"
          control={control}
          render={({ field }) => (
            <MultiSelect
              label="Classes"
              options={filteredClasses?.map((cls: any) => ({
                id: cls.id.toString(),
                label: cls.name,
              }))}
              value={field.value?.map((v) => v.toString()) || []}
              onChange={(newValue) =>
                field.onChange(newValue.map((v) => parseInt(v.toString())))
              }
              error={errors.classes}
              disabled={!selectedGrades?.length}
            />
          )}
        />

        <Controller
          name="students"
          control={control}
          render={({ field }) => (
            <MultiSelect
              label="Students"
              options={filteredStudents?.map((student: any) => ({
                id: student.id,
                label: `${student.firstName} ${student.lastName}`,
              }))}
              value={field.value || []}
              onChange={(newValue) => field.onChange(newValue)}
              error={errors.students}
              disabled={!selectedClasses?.length}
            />
          )}
        />
      </div>

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

export default SpecialProgrammeForm;