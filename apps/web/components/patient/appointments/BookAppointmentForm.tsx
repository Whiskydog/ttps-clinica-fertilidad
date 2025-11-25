"use client";

import { useAppointments } from "@/hooks/appointments/useAppointments";
import { useDoctors } from "@/hooks/doctor/useDoctors";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookAppointmentSchema, ReasonForVisit } from "@repo/contracts";
import { toast } from "@repo/ui";
import { Button } from "@repo/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@repo/ui/field";
import { RadioGroup, RadioGroupItem } from "@repo/ui/radio-group";
import { Spinner } from "@repo/ui/spinner";
import { CircleX } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import AppointmentPicker from "./AppointmentPicker";

export default function BookAppointmentForm() {
  const router = useRouter();
  const { doctors, isLoading, isError, error } = useDoctors();
  const { bookAppointmentMutation } = useAppointments();

  const formSchema = z.object({
    doctorId: z.string().optional(),
    reason: BookAppointmentSchema.shape.reason,
    appointment: BookAppointmentSchema.shape.appointment.nullable(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: ReasonForVisit.InitialConsultation,
      doctorId: "-1",
      appointment: null,
    },
  });
  const watchReason = form.watch("reason");
  const watchDoctorId = form.watch("doctorId");
  const watchAppointment = form.watch("appointment");

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (data.doctorId === "-1") {
      form.setError("doctorId", { message: "Por favor seleccione un médico" });
      return;
    }
    if (!data.appointment) {
      form.setError("appointment", {
        message: "Por favor seleccione una cita disponible",
      });
      return;
    }

    await bookAppointmentMutation.mutateAsync(
      {
        doctorId: Number(data.doctorId),
        reason: data.reason,
        appointment: data.appointment,
      },
      {
        onSuccess: (data) => {
          toast.success(data.message);
          router.push("/patient");
        },
        onError: (error: Error) => {
          toast.error(error.message);
        },
      }
    );
  };

  useEffect(() => {
    form.setValue("appointment", null);
  }, [watchDoctorId, form]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
      <FieldGroup className="gap-4">
        <div className="bg-slate-600 px-4 py-2.5 rounded">
          <h2 className="text-white font-semibold text-base text-center">
            PASO 1: Seleccione el motivo de consulta
          </h2>
        </div>
        <div className="pl-2">
          <Controller
            name="reason"
            control={form.control}
            render={({ field }) => (
              <FieldSet>
                <RadioGroup
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <Field orientation="horizontal">
                    <RadioGroupItem
                      id="reason-initial-consultation"
                      value={ReasonForVisit.InitialConsultation}
                    />
                    <FieldLabel htmlFor={`reason-initial-consultation`}>
                      Primera consulta
                    </FieldLabel>
                  </Field>
                  <Field orientation="horizontal">
                    <RadioGroupItem
                      id="reason-stimulation-monitoring"
                      value={ReasonForVisit.StimulationMonitoring}
                    />
                    <FieldLabel htmlFor={`reason-stimulation-monitoring`}>
                      Monitoreo de estimulación
                    </FieldLabel>
                  </Field>
                  <Field orientation="horizontal">
                    <RadioGroupItem
                      id="reason-egg-retrieval"
                      value={ReasonForVisit.EggRetrieval}
                    />
                    <FieldLabel htmlFor={`reason-egg-retrieval`}>
                      Punción ovárica
                    </FieldLabel>
                  </Field>
                  <Field orientation="horizontal">
                    <RadioGroupItem
                      id="reason-embryo-transfer"
                      value={ReasonForVisit.EmbryoTransfer}
                    />
                    <FieldLabel htmlFor={`reason-embryo-transfer`}>
                      Transferencia de embriones
                    </FieldLabel>
                  </Field>
                </RadioGroup>
              </FieldSet>
            )}
          />
        </div>
      </FieldGroup>
      <FieldGroup className="gap-4">
        <div className="bg-slate-600 px-4 py-2.5 rounded">
          <h2 className="text-white font-semibold text-base text-center">
            PASO 2: Seleccione el médico
          </h2>
        </div>
        <div className="pl-2">
          {isLoading && (
            <div className="flex items-center gap-2 h-24">
              <Spinner />
              <span>Cargando médicos...</span>
            </div>
          )}
          {isError && <p>Error al cargar los médicos: {error?.message}</p>}
          {!isLoading && !isError && doctors && (
            <Controller
              name="doctorId"
              control={form.control}
              render={({ field, fieldState }) => (
                <FieldSet>
                  <RadioGroup
                    name={field.name}
                    value={field.value?.toString()}
                    onValueChange={field.onChange}
                  >
                    {doctors.map((doctor) => (
                      <Field key={doctor.id} orientation="horizontal">
                        <RadioGroupItem
                          id={`doctor-${doctor.id}`}
                          value={doctor.id.toString()}
                          checked={field.value === doctor.id.toString()}
                          onChange={() => field.onChange(doctor.id.toString())}
                        />
                        <FieldLabel htmlFor={`doctor-${doctor.id}`}>
                          Dr. {doctor.firstName} {doctor.lastName}
                        </FieldLabel>
                      </Field>
                    ))}
                    {fieldState.error && (
                      <p className="-mx-1 flex items-center gap-2 text-red-500 font-bold text-sm mt-1">
                        <CircleX /> <span>{fieldState.error.message}</span>
                      </p>
                    )}
                  </RadioGroup>
                </FieldSet>
              )}
            />
          )}
        </div>
      </FieldGroup>
      <div className="space-y-4">
        <div className="bg-slate-600 px-4 py-2.5 rounded">
          <h2 className="text-white font-semibold text-base text-center">
            PASO 3: Seleccione la fecha y hora
          </h2>
        </div>
        <div>
          <Controller
            name="appointment"
            control={form.control}
            render={({ field, fieldState }) => (
              <AppointmentPicker
                doctorId={Number(watchDoctorId)}
                selectedAppt={watchAppointment}
                onSelect={(appt) => {
                  field.onChange(appt);
                  form.clearErrors("appointment");
                }}
                error={fieldState.error}
              />
            )}
          />
        </div>
      </div>
      <div className="space-y-4">
        <div className="bg-slate-600 px-4 py-2.5 rounded">
          <h2 className="text-white font-semibold text-base text-center">
            RESUMEN DE SU TURNO
          </h2>
        </div>
        <div className="px-2">
          <p>
            <span className="font-bold">Médico: </span>
            {watchDoctorId && watchDoctorId !== "-1"
              ? `Dr. ${
                  doctors?.find((doc) => doc.id === Number(watchDoctorId))
                    ?.firstName
                } ${
                  doctors?.find((doc) => doc.id === Number(watchDoctorId))
                    ?.lastName
                }`
              : "No seleccionado"}
          </p>
          <p>
            <span className="font-bold">Motivo: </span>
            {watchReason === "initial-consultation"
              ? "Primera consulta"
              : watchReason === "stimulation-monitoring"
                ? "Monitoreo de estimulación"
                : watchReason === "egg-retrieval"
                  ? "Punción ovárica"
                  : watchReason === "embryo-transfer"
                    ? "Transferencia de embriones"
                    : "No seleccionado"}
          </p>
          <p>
            <span className="font-bold">Fecha y hora: </span>
            <span>
              {watchAppointment
                ? moment.utc(watchAppointment.dateTime).format("LLLL")
                : "No seleccionado"}
            </span>
          </p>
        </div>
      </div>
      <div className="flex justify-center">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Spinner />
              <span>Reservando</span>
            </>
          ) : (
            <span>Reservar cita</span>
          )}
        </Button>
      </div>
    </form>
  );
}
