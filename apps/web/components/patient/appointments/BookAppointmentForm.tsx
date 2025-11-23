"use client";

import { useDoctors } from "@/hooks/doctor/useDoctors";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@repo/ui/field";
import { CodeBlock, CodeBlockCode } from "@repo/ui/code-block";
import { RadioGroup, RadioGroupItem } from "@repo/ui/radio-group";
import { Spinner } from "@repo/ui/spinner";
import { CircleX } from "lucide-react";
import moment from "moment";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import AppointmentPicker from "./AppointmentPicker";
import { toast } from "@repo/ui";

export default function BookAppointmentForm() {
  const { doctors, isLoading, isError, error } = useDoctors();

  const formSchema = z.object({
    doctorId: z.string().optional(),
    reason: z.enum([
      "initial-consultation",
      "stimulation-monitoring",
      "egg-retrieval",
      "embryo-transfer",
    ]),
    appointment: z
      .object({
        id: z.number(),
        dateTime: z.string(),
      })
      .nullable(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "initial-consultation",
      doctorId: "-1",
      appointment: null,
    },
  });
  const watchDoctorId = form.watch("doctorId");
  const watchAppointment = form.watch("appointment");

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (data.doctorId === "-1") {
      form.setError("doctorId", { message: "Por favor seleccione un médico" });
      return;
    }
    if (!data.appointment) {
      console.log("No appointment selected");
      form.setError("appointment", {
        message: "Por favor seleccione una cita disponible",
      });
      return;
    }

    toast.custom(() => (
      <div className="ring-1 ring-black/5 w-full items-center p-4">
        <div className="flex items-center gap-2 mb-2">
          <CircleX className="h-5 w-5 text-blue-600" />
          <span className="font-medium">Datos del turno reservado:</span>
        </div>
        <CodeBlock className="max-w-full">
          <CodeBlockCode
            code={JSON.stringify(data, null, 2)}
            theme="github-dark"
          />
        </CodeBlock>
      </div>
    ));
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
                      value={"initial-consultation"}
                    />
                    <FieldLabel htmlFor={`reason-initial-consultation`}>
                      Primera consulta
                    </FieldLabel>
                  </Field>
                  <Field orientation="horizontal">
                    <RadioGroupItem
                      id="reason-stimulation-monitoring"
                      value={"stimulation-monitoring"}
                    />
                    <FieldLabel htmlFor={`reason-stimulation-monitoring`}>
                      Monitoreo de estimulación
                    </FieldLabel>
                  </Field>
                  <Field orientation="horizontal">
                    <RadioGroupItem
                      id="reason-egg-retrieval"
                      value={"egg-retrieval"}
                    />
                    <FieldLabel htmlFor={`reason-egg-retrieval`}>
                      Punción ovárica
                    </FieldLabel>
                  </Field>
                  <Field orientation="horizontal">
                    <RadioGroupItem
                      id="reason-embryo-transfer"
                      value={"embryo-transfer"}
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
            {form.getValues("reason") === "initial-consultation"
              ? "Primera consulta"
              : form.getValues("reason") === "stimulation-monitoring"
                ? "Monitoreo de estimulación"
                : form.getValues("reason") === "egg-retrieval"
                  ? "Punción ovárica"
                  : form.getValues("reason") === "embryo-transfer"
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
