import React, { useState, useEffect, useRef } from "react";
import { ChevronUpDownIcon, CheckIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";

interface Option {
  id: string | number;
  label: string;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  value?: string[];
  onChange: (value: string[]) => void;
  error?: { message?: string };
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  value = [], // Provide a default empty array
  onChange,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
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

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (option: Option) => {
    const newValue = value.includes(option.id.toString())
      ? value.filter((id) => id !== option.id.toString())
      : [...value, option.id.toString()];
    onChange(newValue);
  };

  const selectedOptions = options.filter((option) => 
    value.includes(option.id.toString())
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <label className="text-xs font-medium text-gray-700 mb-1 block">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          className="relative py-3 px-4 w-full text-left cursor-pointer bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedOptions.length
            ? selectedOptions.map((option) => option.label).join(", ")
            : "Select multiple options..."}
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-2 w-full max-h-60 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg">
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
                key={option.id}
                className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                onClick={() => toggleOption(option)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{option.label}</span>
                  {value.includes(option.id.toString()) && (
                    <CheckIcon className="h-4 w-4 text-blue-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
    </div>
  );
};

export default MultiSelect;