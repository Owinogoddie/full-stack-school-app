// components/date-range-picker.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { UseFormRegister, UseFormSetValue } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { DateRange } from "react-day-picker";
import styles from "./DateRangePicker.module.css";
import { Calendar } from "./Calendar";

interface DateRangePickerProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  error?: any;
  className?: string;
}

export default function DateRangePicker({
  label,
  name,
  register,
  setValue,
  error,
  className,
}: DateRangePickerProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Register the field without doing anything with the return value
  register(name);

  // Update form value when date changes
  useEffect(() => {
    setValue(name, date);
  }, [date, name, setValue]);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <label className={styles.label}>
        {label}
      </label>
      <div className={styles.pickerContainer}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={styles.button}
        >
          <CalendarIcon className={styles.icon} />
          {date?.from ? (
            date.to ? (
              <span>
                {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
              </span>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </button>

        {isOpen && (
          <div ref={popoverRef} className={styles.popover}>
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={(newDate) => {
                setDate(newDate);
                if (newDate?.from && newDate?.to) {
                  setIsOpen(false);
                }
              }}
              numberOfMonths={2}
            />
          </div>
        )}
      </div>
      {error && (
        <p className={styles.error}>
          {error.message}
        </p>
      )}
    </div>
  );
}