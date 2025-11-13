'use client';

import { useState } from 'react';
import { Button } from '@repo/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarEvent {
  id: number;
  date: string;
  time: string;
  type: string;
  title: string;
  status: string;
}

interface MonthCalendarProps {
  events: CalendarEvent[];
}

const DAYS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const MONTHS = [
  'ENERO',
  'FEBRERO',
  'MARZO',
  'ABRIL',
  'MAYO',
  'JUNIO',
  'JULIO',
  'AGOSTO',
  'SEPTIEMBRE',
  'OCTUBRE',
  'NOVIEMBRE',
  'DICIEMBRE',
];

export function MonthCalendar({ events }: MonthCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1)); // Septiembre 2025

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

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
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.find((event) => event.date === dateStr);
  };

  const getEventColor = (type: string, status: string) => {
    if (status === 'completed') return 'bg-purple-400';
    if (type === 'monitoreo') return 'bg-amber-700';
    if (type === 'puncion') return 'bg-rose-300';
    return 'bg-gray-700';
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
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
        <h2 className="text-xl font-bold">
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
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
          const event = day ? getEventForDay(day) : null;

          return (
            <div
              key={index}
              className={`min-h-[100px] border border-gray-400 p-2 ${
                event ? getEventColor(event.type, event.status) : day ? 'bg-gray-800 text-white' : 'bg-gray-900'
              }`}
            >
              {day && (
                <>
                  <div className={`text-sm font-semibold mb-1 ${event ? 'text-white' : ''}`}>
                    {day}
                  </div>
                  {event && (
                    <div className="text-xs text-white">
                      <div>{event.time}</div>
                      <div>{event.title}</div>
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
