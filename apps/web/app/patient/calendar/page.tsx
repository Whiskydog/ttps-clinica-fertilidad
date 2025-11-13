'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { MonthCalendar } from '@/components/patient/calendar/month-calendar';
import { UpcomingAppointments } from '@/components/patient/calendar/upcoming-appointments';
import { CalendarLegend } from '@/components/patient/calendar/calendar-legend';
import { mockCalendarEvents, mockUpcomingAppointments } from '../lib/mock-data';

export default function CalendarPage() {
  const [view, setView] = useState<'mes' | 'semana' | 'lista'>('mes');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/patient">
          <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0">
            ← Volver al Dashboard
          </Button>
        </Link>
        <Button className="bg-rose-300 hover:bg-rose-400 text-black">
          Solicitar Nuevo Turno
        </Button>
      </div>

      <div className="flex gap-2">
        <span className="font-semibold">Vista:</span>
        <Button
          size="sm"
          variant={view === 'mes' ? 'default' : 'outline'}
          onClick={() => setView('mes')}
        >
          Mes
        </Button>
        <Button
          size="sm"
          variant={view === 'semana' ? 'default' : 'outline'}
          onClick={() => setView('semana')}
        >
          Semana
        </Button>
        <Button
          size="sm"
          variant={view === 'lista' ? 'default' : 'outline'}
          onClick={() => setView('lista')}
        >
          Lista
        </Button>
      </div>

      {view === 'mes' && <MonthCalendar events={mockCalendarEvents} />}

      {view === 'semana' && (
        <div className="text-center py-20 text-gray-400">Vista semanal - Por implementar</div>
      )}

      {view === 'lista' && (
        <div className="text-center py-20 text-gray-400">Vista lista - Por implementar</div>
      )}

      <UpcomingAppointments appointments={mockUpcomingAppointments} />

      <CalendarLegend />
    </div>
  );
}
