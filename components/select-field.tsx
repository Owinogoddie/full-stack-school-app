import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";
import { UseFormSetValue } from "react-hook-form";
interface Option {
    value: string | number;
    label: string;
  }
  
  interface SelectFieldProps {
    label: string;
    options: Option[];
    name: string;
    register: any;
    setValue: UseFormSetValue<any>;  // Change this line
    error?: { message?: string };
    defaultValue?: string | number;
  }

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  options,
  name,
  register,
  setValue,
  error,
  defaultValue,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const defaultOption = options.find(option => option.value === defaultValue);
    if (defaultOption) {
      setSelectedOption(defaultOption);
      setValue(name, defaultOption.value);
    }
  }, [defaultValue, options, name, setValue]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option: Option) => {
    setSelectedOption(option);
    setValue(name as any, option.value);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-2 w-full" ref={wrapperRef}>
      <label className="text-xs text-gray-500">{label}</label>
      <div className="relative">
        <button
          type="button"
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full text-left flex justify-between items-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{selectedOption ? selectedOption.label : 'Select an option'}</span>
          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
        </button>
        <input
          type="hidden"
          {...register(name)}
        />
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            <div className="sticky top-0 bg-white p-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  className="w-full p-2 pl-10 text-sm border border-gray-300 rounded-md"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error.message}</p>}
    </div>
  );
};

export default SelectField;