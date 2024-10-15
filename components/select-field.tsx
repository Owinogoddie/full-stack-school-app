// components/select-field.tsx
import React from "react";
import { UseFormRegister, UseFormSetValue } from "react-hook-form";

interface SelectFieldProps {
  label: string;
  options: { value: string; label: string }[];
  name: string;
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  error?: { message?: string };
  defaultValue?: string;
  disabled?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  options,
  name,
  register,
  setValue,
  error,
  defaultValue,
  disabled = false,
}) => {
  return (
    <div className="w-full">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        id={name}
        {...register(name)}
        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onChange={(e) => setValue(name, e.target.value)}
        defaultValue={defaultValue}
        disabled={disabled}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-2 text-sm text-red-600">{error.message}</p>}
    </div>
  );
};

export default SelectField;