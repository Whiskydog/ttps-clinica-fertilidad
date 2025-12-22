"use client";

import { getAppointments } from "@/app/actions/patients/appointments/get";
import { CalendarLegend } from "@/components/patient/calendar/calendar-legend";
import { MonthCalendar } from "@/components/patient/calendar/month-calendar";
import { UpcomingAppointments } from "@/components/patient/calendar/upcoming-appointments";
import { Button } from "@repo/ui/button";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CalendarPage() {
  const router = useRouter();

  const {
    data: appointments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => getAppointments(),
  });

  // Próximas citas (filtrar fechas futuras)
  const upcomingAppointments = (appointments ?? [])
    .filter((apt) => moment.utc(apt.date).isAfter(moment.utc()))
    .sort((a, b) => moment.utc(a.date).diff(moment.utc(b.date)))
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando calendario...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error al cargar las citas</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/patient">
          <Button
            variant="link"
            className="text-blue-400 hover:text-blue-300 p-0"
          >
            ← Volver al Dashboard
          </Button>
        </Link>
        <Button
          className="bg-rose-300 hover:bg-rose-400 text-black"
          onClick={() => router.push("/patient/appointments/new")}
        >
          Solicitar Nuevo Turno
        </Button>
      </div>

      {appointments && appointments.length > 0 && (
        <MonthCalendar appointments={appointments} />
      )}
      {appointments && appointments.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          No tienes citas programadas
        </div>
      )}
      <UpcomingAppointments appointments={upcomingAppointments} />

      <CalendarLegend />
    </div>
  );
}
