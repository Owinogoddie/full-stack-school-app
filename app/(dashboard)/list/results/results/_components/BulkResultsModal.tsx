'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SelectField from "@/components/select-field";

const schema = z.object({
  examId: z.coerce.number().nonnegative("Exam ID is required!"),
  subjectId: z.coerce.number().nonnegative("Subject ID is required!"),
  academicYearId: z.coerce.number().nonnegative("Academic Year ID is required!"),
  classId: z.coerce.number().nonnegative("Class ID is required!"),
  gradeScaleId: z.coerce.number().nonnegative("Grade Scale ID is required!"),
});

type FormData = z.infer<typeof schema>;

interface BulkResultsModalProps {
  relatedData: {
    exams: { id: number; title: string }[];
    subjects: { id: number; name: string }[];
    academicYears: { id: number; year: string }[];
    classes: { id: number; name: string }[];
    gradeScales: { id: number; name: string }[];
  };
  onSubmit: (data: FormData) => void;
}

export default function BulkResultsModal({
  relatedData,
  onSubmit,
}: BulkResultsModalProps) {
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 sm:p-0">
  <div className="bg-white rounded-lg w-full sm:w-1/2 max-w-3xl">
    <div className="p-4 sm:p-6">
      <h2 className="text-xl font-bold mb-4">Select Parameters</h2>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <SelectField
          label="Exam"
          options={relatedData.exams.map((exam) => ({
            value: exam.id.toString(),
            label: exam.title,
          }))}
          name="examId"
          register={register}
          error={errors.examId}
          setValue={setValue}
        />
        <SelectField
          label="Subject"
          options={relatedData.subjects.map((subject) => ({
            value: subject.id.toString(),
            label: subject.name,
          }))}
          name="subjectId"
          register={register}
          error={errors.subjectId}
          setValue={setValue}
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
          label="Class"
          options={relatedData.classes.map((class_) => ({
            value: class_.id.toString(),
            label: class_.name,
          }))}
          name="classId"
          register={register}
          error={errors.classId}
          setValue={setValue}
        />
        <SelectField
          label="Grade Scale"
          options={relatedData.gradeScales.map((scale) => ({
            value: scale.id.toString(),
            label: scale.name,
          }))}
          name="gradeScaleId"
          register={register}
          error={errors.gradeScaleId}
          setValue={setValue}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md w-full"
        >
          Continue
        </button>
      </form>
    </div>
  </div>
</div>
  );
}