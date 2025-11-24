import { useDoctorAvailableAppointments } from "@/hooks/doctor/useDoctorAvailableAppointments";
import { getNextFiveWeeksDays } from "@/utils/date-utils";
import { AppointmentDetail } from "@repo/contracts";
import { Spinner } from "@repo/ui/spinner";
import moment from "moment";
import { useEffect, useState } from "react";
import AppointmentDatePicker from "./AppointmentDatePicker";
import AppointmentTimePicker from "./AppointmentTimePicker";
import { FieldError } from "react-hook-form";
import { CircleX } from "lucide-react";

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
  const {
    appointments,
    isLoading,
    isError,
    error: fetchError,
  } = useDoctorAvailableAppointments(doctorId);

  const doctorSelected = doctorId && doctorId > 0;
  const nextFiveWeeks = getNextFiveWeeksDays();

  useEffect(() => {
    setSelectedDate(null);
  }, [doctorId]);

  return (
    <div>
      {doctorSelected && isLoading && (
        <div className="bg-slate-100 p-4 rounded flex items-center justify-center h-32 gap-2">
          <Spinner />
          <span>Cargando citas disponibles...</span>
        </div>
      )}
      {isError && (
        <div className="text-red-500">Error: {fetchError?.message}</div>
      )}
      {!doctorSelected && (
        <div className="bg-slate-100 p-4 rounded flex items-center justify-center h-32 gap-2">
          Por favor seleccione un médico para ver las citas disponibles.
        </div>
      )}
      {doctorSelected &&
        !isLoading &&
        !isError &&
        appointments &&
        appointments.length === 0 && (
          <div className="bg-slate-100 p-4 rounded flex items-center justify-center h-32 gap-2">
            No hay citas disponibles para este médico.
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
