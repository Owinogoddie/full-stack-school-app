// components/select-field.tsx
import React, { useState, useRef, useEffect } from "react";
import { UseFormRegister, UseFormSetValue } from "react-hook-form";
import { ChevronUpDownIcon, CheckIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";

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
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(defaultValue);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleSelect = (value: string) => {
    setValue(name, value);
    setSelectedOption(value);
    setIsOpen(false);
  };

  const selectedLabel = options.find(option => option.value === selectedOption)?.label || "Select an option";

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          className={`relative w-full text-left cursor-pointer bg-white border border-gray-200 rounded-lg py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
          }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <span className="block truncate">{selectedLabel}</span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            <div className="sticky top-0 bg-white p-2">
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="block w-full rounded-md border border-gray-200 py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`${
                  option.value === selectedOption ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                } cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50`}
                onClick={() => handleSelect(option.value)}
              >
                <span className={`block truncate ${option.value === selectedOption ? 'font-semibold' : 'font-normal'}`}>
                  {option.label}
                </span>
                {option.value === selectedOption && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <select
        {...register(name)}
        className="sr-only"
        value={selectedOption}
        onChange={(e) => handleSelect(e.target.value)}
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