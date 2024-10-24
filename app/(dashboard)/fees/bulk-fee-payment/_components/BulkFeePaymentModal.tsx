// app/bulk-fee-payment/_components/BulkFeePaymentModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Select, { SingleValue, MultiValue } from 'react-select';

// option types
type SingleOptionType = {
  value: string | number;
  label: string;
};

type MultiOptionType = {
  value: string;
  label: string;
};

const schema = z.object({
  academicYearId: z.coerce.number().positive('Academic Year is required'),
  termId: z.string().min(1, 'Term is required'),
  gradeId: z.coerce.number().optional(),
  classIds: z.array(z.coerce.number()).min(1, 'At least one class must be selected'),
  feeIds: z.array(z.string()).min(1, 'At least one fee must be selected')
});

type FormData = z.infer<typeof schema>;

interface InitialData {
  academicYears: { id: number; year: string }[];
  terms: { id: string; name: string; academicYearId: number }[];
  grades: { id: number; name: string }[];
  classes: { id: number; name: string; gradeId: number }[];
  fees: {
    id: string;
    name: string;
    description: string | null;
    amount: number;
    academicYearId: number | null;
    termId: string | null;
    feeTypeId: string | null;
  }[];
}

interface BulkFeePaymentModalProps {
  initialData: InitialData;
  onSubmit: (data: FormData) => void;
}

export default function BulkFeePaymentModal({
  initialData,
  onSubmit
}: BulkFeePaymentModalProps) {
  const [filteredTerms, setFilteredTerms] = useState(initialData.terms);
  const [filteredClasses, setFilteredClasses] = useState(initialData.classes);
  const [filteredFees, setFilteredFees] = useState(initialData.fees);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      classIds: [],
      feeIds: []
    }
  });

  const selectedAcademicYearId = watch('academicYearId');
  const selectedGradeId = watch('gradeId');
  const selectedTermId = watch('termId');

  // Filter terms when academic year changes
  useEffect(() => {
    if (selectedAcademicYearId) {
      const terms = initialData.terms.filter(
        term => term.academicYearId === selectedAcademicYearId
      );
      setFilteredTerms(terms);
      setValue('termId', ''); // Reset selected term
      setValue('feeIds', []); // Reset selected fees
    }
  }, [selectedAcademicYearId, initialData.terms, setValue]);

  // Filter and auto-select classes when grade changes
  useEffect(() => {
    if (selectedGradeId) {
      const classes = initialData.classes.filter(
        cls => cls.gradeId === selectedGradeId
      );
      setFilteredClasses(classes);
      // Auto-select all classes for the selected grade
      setValue('classIds', classes.map(cls => cls.id));
    } else {
      setFilteredClasses(initialData.classes);
    }
  }, [selectedGradeId, initialData.classes, setValue]);

  // Filter fees based on academic year and term
  useEffect(() => {
    if (selectedAcademicYearId && selectedTermId) {
      const fees = initialData.fees.filter(
        fee => 
          fee.academicYearId === selectedAcademicYearId && 
          fee.termId === selectedTermId
      );
      setFilteredFees(fees);
    } else {
      setFilteredFees([]);
    }
  }, [selectedAcademicYearId, selectedTermId, initialData.fees]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Select Payment Parameters</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Year
            </label>
            <Controller
              name="academicYearId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={initialData.academicYears.map(year => ({
                    value: year.id,
                    label: year.year
                  }))}
                  onChange={option => field.onChange(option?.value)}
                  value={initialData.academicYears
                    .map(year => ({
                      value: year.id,
                      label: year.year
                    }))
                    .find(option => option.value === field.value)}
                  className="basic-select"
                  classNamePrefix="select"
                />
              )}
            />
            {errors.academicYearId && (
              <p className="mt-1 text-sm text-red-600">{errors.academicYearId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Term
            </label>
            <Controller
              name="termId"
              control={control}
              render={({ field }) => (
                <Select<SingleOptionType>
                  {...field}
                  options={filteredTerms.map(term => ({
                    value: term.id,
                    label: term.name
                  }))}
                  onChange={(option: SingleValue<SingleOptionType>) => 
                    field.onChange(option?.value)}
                  value={filteredTerms
                    .map(term => ({
                      value: term.id,
                      label: term.name
                    }))
                    .find(option => option.value === field.value)}
                  className="basic-select"
                  classNamePrefix="select"
                />
              )}
            />
            {errors.termId && (
              <p className="mt-1 text-sm text-red-600">{errors.termId.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grade (Optional)
          </label>
          <Controller
            name="gradeId"
            control={control}
            render={({ field }) => (
              <Select<SingleOptionType>
                {...field}
                isClearable
                options={initialData.grades.map(grade => ({
                  value: grade.id,
                  label: grade.name
                }))}
                onChange={(option: SingleValue<SingleOptionType>) => 
                  field.onChange(option?.value)}
                value={initialData.grades
                  .map(grade => ({
                    value: grade.id,
                    label: grade.name
                  }))
                  .find(option => option.value === field.value)}
                className="basic-select"
                classNamePrefix="select"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Classes
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredClasses.map(cls => (
              <label key={cls.id} className="flex items-center space-x-2">
                <Controller
                  name="classIds"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value.includes(cls.id)}
                      onChange={e => {
                        const newValue = e.target.checked
                          ? [...field.value, cls.id]
                          : field.value.filter(id => id !== cls.id);
                        field.onChange(newValue);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  )}
                />
                <span className="text-sm text-gray-700">{cls.name}</span>
              </label>
            ))}
          </div>
          {errors.classIds && (
            <p className="mt-1 text-sm text-red-600">{errors.classIds.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fees
          </label>
          <Controller
            name="feeIds"
            control={control}
            render={({ field }) => (
              <Select<MultiOptionType, true>
                {...field}
                isMulti
                options={filteredFees.map(fee => ({
                  value: fee.id,
                  label: `${fee.name} (${fee.amount})`
                }))}
                onChange={(newValue: MultiValue<MultiOptionType>) => {
                  field.onChange(newValue.map(item => item.value));
                }}
                value={filteredFees
                  .filter(fee => field.value?.includes(fee.id))
                  .map(fee => ({
                    value: fee.id,
                    label: `${fee.name} (${fee.amount})`
                  }))}
                className="basic-select"
                classNamePrefix="select"
              />
            )}
          />
          {errors.feeIds && (
            <p className="mt-1 text-sm text-red-600">
              {errors.feeIds.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md 
                     transition duration-150 ease-in-out focus:outline-none focus:ring-2 
                     focus:ring-blue-500 focus:ring-offset-2"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}