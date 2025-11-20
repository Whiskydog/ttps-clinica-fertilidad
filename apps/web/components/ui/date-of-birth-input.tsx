"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";

interface DateOfBirthInputProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const MONTHS = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

function getDaysInMonth(month: number, year: number): number {
  if (!month || !year) return 31;
  return new Date(year, month, 0).getDate();
}

function generateYears(): string[] {
  const currentYear = new Date().getFullYear();
  const minYear = 1920;
  const maxYear = currentYear - 18;
  const years: string[] = [];

  for (let year = maxYear; year >= minYear; year--) {
    years.push(year.toString());
  }

  return years;
}

function generateDays(month: string, year: string): string[] {
  const monthNum = month ? parseInt(month, 10) : 0;
  const yearNum = year ? parseInt(year, 10) : new Date().getFullYear();
  const daysInMonth = getDaysInMonth(monthNum, yearNum);

  const days: string[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day.toString().padStart(2, "0"));
  }

  return days;
}

export function DateOfBirthInput({
  value,
  onChange,
  disabled,
}: DateOfBirthInputProps) {
  // Parse initial value
  const parseValue = (val?: string) => {
    if (!val) return { day: "", month: "", year: "" };
    const parts = val.split("-");
    return {
      year: parts[0] || "",
      month: parts[1] || "",
      day: parts[2] || "",
    };
  };

  const [localDay, setLocalDay] = useState(() => parseValue(value).day);
  const [localMonth, setLocalMonth] = useState(() => parseValue(value).month);
  const [localYear, setLocalYear] = useState(() => parseValue(value).year);

  // Sync with external value changes
  useEffect(() => {
    const parsed = parseValue(value);
    setLocalDay(parsed.day);
    setLocalMonth(parsed.month);
    setLocalYear(parsed.year);
  }, [value]);

  // Call onChange when all three fields are filled
  useEffect(() => {
    if (localDay && localMonth && localYear) {
      const maxDays = getDaysInMonth(parseInt(localMonth, 10), parseInt(localYear, 10));
      const validDay = parseInt(localDay, 10) > maxDays
        ? maxDays.toString().padStart(2, "0")
        : localDay;

      const newValue = `${localYear}-${localMonth}-${validDay}`;
      if (newValue !== value) {
        onChange(newValue);
      }
    }
  }, [localDay, localMonth, localYear, onChange, value]);

  const years = generateYears();
  const days = generateDays(localMonth, localYear);

  return (
    <div className="grid grid-cols-3 gap-2">
      <Select
        value={localDay}
        onValueChange={setLocalDay}
        disabled={disabled}
      >
        <SelectTrigger className="bg-white border-gray-300 text-gray-900">
          <SelectValue placeholder="Día" />
        </SelectTrigger>
        <SelectContent>
          {days.map((d) => (
            <SelectItem key={d} value={d}>
              {parseInt(d, 10)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={localMonth}
        onValueChange={setLocalMonth}
        disabled={disabled}
      >
        <SelectTrigger className="bg-white border-gray-300 text-gray-900">
          <SelectValue placeholder="Mes" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={localYear}
        onValueChange={setLocalYear}
        disabled={disabled}
      >
        <SelectTrigger className="bg-white border-gray-300 text-gray-900">
          <SelectValue placeholder="Año" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
