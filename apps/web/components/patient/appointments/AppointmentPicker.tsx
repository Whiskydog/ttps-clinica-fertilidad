import { useAppointments } from "@/hooks/appointments/useAppointments";
import { getNextFiveWeeksDays } from "@/utils/date-utils";
import { AppointmentDetail } from "@repo/contracts";
import { Spinner } from "@repo/ui/spinner";
import { CircleX } from "lucide-react";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { FieldError } from "react-hook-form";
import AppointmentDatePicker from "./AppointmentDatePicker";
import AppointmentTimePicker from "./AppointmentTimePicker";

interface Props {
  doctorId: number;
  selectedAppt: Partial<AppointmentDetail> | null;
  onSelect?: (appt: Partial<AppointmentDetail> | null) => void;
  error?: FieldError;
}

export default function AppointmentPicker({
  doctorId,
  selectedAppt,
  onSelect,
  error,
}: Props) {
  const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(null);
  const { availableAppointmentsQuery } = useAppointments();
  const {
    data: availableAppointments,
    isLoading,
    isError,
    error: fetchError,
  } = availableAppointmentsQuery;

  const appointments = useMemo(() => {
    if (!availableAppointments) return [];

    if (doctorId < 0) {
      const groupedAppointments = availableAppointments.reduce(
        (acc, appt) => {
          (acc[appt.dateTime] ??= []).push(appt);
          return acc;
        },
        {} as Record<string, AppointmentDetail[]>
      );

      return Object.values(groupedAppointments).map(
        (appts) => appts.at(Math.floor(Math.random() * appts.length))!
      );
    }

    return availableAppointments.filter((appt) => appt.doctorId === doctorId);
  }, [availableAppointments, doctorId]);

  const nextFiveWeeks = getNextFiveWeeksDays();

  useEffect(() => {
    setSelectedDate(null);
  }, [doctorId]);

  return (
    <div>
      {isLoading && (
        <div className="bg-slate-100 p-4 rounded flex items-center justify-center h-32 gap-2">
          <Spinner />
          <span>Cargando citas disponibles...</span>
        </div>
      )}
      {isError && (
        <div className="text-red-500">Error: {fetchError?.message}</div>
      )}
      {!isLoading && !isError && appointments && appointments.length === 0 && (
        <div className="bg-slate-100 p-4 rounded flex items-center justify-center h-32 gap-2">
          No hay citas disponibles{doctorId > 0 && " para este médico"}.
        </div>
      )}
      {!isLoading && !isError && appointments && appointments.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <AppointmentDatePicker
            timespan={nextFiveWeeks}
            selectedDate={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);
              onSelect?.(null);
            }}
            appointments={appointments}
          />
          <AppointmentTimePicker
            selectedDate={selectedDate}
            selectedAppt={selectedAppt}
            onSelect={onSelect}
            appointments={appointments}
          />
        </div>
      )}
      {error && (
        <p className="flex items-center gap-2 text-red-500 font-bold mt-2">
          <CircleX />
          <span>{error.message}</span>
        </p>
      )}
    </div>
  );
}
