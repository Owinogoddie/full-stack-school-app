// components/Calendar.tsx
"use client";

import { DayPicker } from "react-day-picker";
import "./Calendar.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ ...props }: CalendarProps) {
  return <DayPicker {...props} />;
}