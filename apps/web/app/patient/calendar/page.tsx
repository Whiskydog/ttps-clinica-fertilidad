"use client";

import { getAppointments } from "@/app/actions/patients/appointments/get";
import { CalendarLegend } from "@/components/patient/calendar/calendar-legend";
import { MonthCalendar } from "@/components/patient/calendar/month-calendar";
import { UpcomingAppointments } from "@/components/patient/calendar/upcoming-appointments";
import { useDoctors } from "@/hooks/doctor/useDoctors";
import { TurnoRaw } from "@repo/contracts";
import { Button } from "@repo/ui/button";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CalendarPage() {
  const [view, setView] = useState<"mes" | "semana" | "lista">("mes");
  const router = useRouter();

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => getAppointments(),
  });

  const {
    doctors,
    isLoading: isLoadingDoctors,
    error: errorDoctors,
  } = useDoctors();

  const appointments: TurnoRaw[] = response?.data.data || [];

  // Transformar appointments del backend al formato esperado por el calendario
  const calendarEvents = appointments.map((apt) => {
    const dateAndTime = moment.utc(apt.fecha_hora);
    const date = dateAndTime.format("YYYY-MM-DD");
    const time = dateAndTime.format("HH:mm");

    return {
      id: apt.id,
      date: date!,
      time,
      type: "consulta",
      title: "Cita Médica",
      status: "scheduled" as const,
      doctorId: apt.id_medico,
    };
  });

  // Próximas citas (filtrar fechas futuras)
  const now = new Date();
  const upcomingAppointments = appointments
    .filter((apt) => new Date(apt.fecha_hora) >= now)
    .sort(
      (a, b) =>
        new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime()
    )
    .slice(0, 5)
    .map((apt) => {
      const dateAndTime = moment.utc(apt.fecha_hora);
      const date = dateAndTime.format("YYYY-MM-DD");
      const time = dateAndTime.format("HH:mm");
      const doctor = doctors?.find((doc) => doc.id === apt.id_medico);

      return {
        id: apt.id,
        date: date!,
        time,
        type: "Consulta médica",
        doctor: doctor
          ? `${doctor?.firstName} ${doctor?.lastName}`
          : "Desconocido",
        operatingRoom: "",
      };
    });

  if (isLoading || isLoadingDoctors) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando calendario...</div>
      </div>
    );
  }

  if (error || errorDoctors) {
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

      {view === "mes" && calendarEvents.length > 0 && (
        <MonthCalendar events={calendarEvents} />
      )}
      {view === "mes" && calendarEvents.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          No tienes citas programadas
        </div>
      )}

      {view === "semana" && (
        <div className="text-center py-20 text-gray-400">
          Vista semanal - Por implementar
        </div>
      )}

      {view === "lista" && (
        <div className="text-center py-20 text-gray-400">
          Vista lista - Por implementar
        </div>
      )}

      <UpcomingAppointments appointments={upcomingAppointments} />

      <CalendarLegend />
    </div>
  );
}
