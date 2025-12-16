"use client";

import { getDisplayName } from "@/utils/appointment-utils";
import { Appointment } from "@repo/contracts";
import { Button } from "@repo/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import moment from "moment";
import "moment/locale/es";
import { useEffect, useState } from "react";

interface MonthCalendarProps {
  appointments: Appointment[];
}

const DAYS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

export function MonthCalendar({ appointments }: MonthCalendarProps) {
  const [currentDate, setCurrentDate] = useState(moment.utc());

  useEffect(() => {
    moment.locale("es");
    setCurrentDate(moment.utc());
  }, []);

  const getDaysInMonth = (date: moment.Moment) => {
    const daysInMonth = date.daysInMonth();
    const firstDay = date.clone().startOf("month").day();

    const days: (number | null)[] = [];

    // Agregar días vacíos al inicio
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Agregar días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const getEventForDay = (day: number) => {
    const targetDate = currentDate.clone().date(day);
    return appointments.find((appointment) => {
      const appointmentDate = moment.utc(appointment.date);
      return appointmentDate.isSame(targetDate, "day");
    });
  };

  const getEventColor = (reason: string) => {
    switch (reason) {
      case "embryo-transfer":
        return "bg-purple-400";
      case "stimulation-monitoring":
        return "bg-amber-700";
      case "egg-retrieval":
        return "bg-rose-300";
      default:
        return "bg-gray-700";
    }
  };

  const previousMonth = () => {
    setCurrentDate((prev) => prev.clone().subtract(1, "month"));
  };

  const nextMonth = () => {
    setCurrentDate((prev) => prev.clone().add(1, "month"));
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="link"
          className="text-blue-400 hover:text-blue-300"
          onClick={previousMonth}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Anterior
        </Button>
        <h2 className="text-xl font-bold uppercase">
          {currentDate.format("MMMM YYYY")}
        </h2>
        <Button
          variant="link"
          className="text-blue-400 hover:text-blue-300"
          onClick={nextMonth}
        >
          Siguiente
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-7 border border-gray-600">
        {/* Header */}
        {DAYS.map((day) => (
          <div
            key={day}
            className="bg-blue-400 text-black font-bold text-center py-2 border border-gray-600"
          >
            {day}
          </div>
        ))}

        {/* Days */}
        {days.map((day, index) => {
          const appointment = day ? getEventForDay(day) : null;

          return (
            <div
              key={index}
              className={`min-h-[100px] border border-gray-400 p-2 ${
                appointment
                  ? getEventColor(appointment.reason)
                  : day
                    ? "bg-gray-800 text-white"
                    : "bg-gray-900"
              }`}
            >
              {day && (
                <>
                  <div
                    className={`text-sm font-semibold mb-1 ${appointment ? "text-white" : ""}`}
                  >
                    {day}
                  </div>
                  {appointment && (
                    <div className="text-xs text-white">
                      <div>{moment.utc(appointment.date).format("HH:mm")}</div>
                      <div>{getDisplayName(appointment.reason)}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
