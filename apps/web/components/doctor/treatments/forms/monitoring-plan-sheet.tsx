"use client";

import { useMemo, useState } from "react";
import moment from "moment";
import { useForm, useWatch } from "react-hook-form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@repo/ui/sheet";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Badge } from "@repo/ui/badge";
import { Activity, CalendarDays, Clock, RefreshCw } from "lucide-react";
import { toast } from "@repo/ui";
import { finalizeMonitoringPlans } from "@/app/actions/doctor/monitoring-plans/create";
import { getDoctorAvailableSlots } from "@/app/actions/doctor/appointments/get-available-slots";

type MonitoringRow = {
  planId: number;
  sequence: number;
  plannedDay: number;
  appointmentId?: number | null;
  appointmentDateTime?: string | null;
  isOvertime: boolean;
  overtimeTime?: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatmentId: number;
  protocol: any;
  doctorId?: number;
  onSuccess: () => void;
};

type ExternalSlot = {
  id: number;
  doctorId: number;
  patientId: number | null;
  dateTime: string;
};

type SlotItem = {
  id: number;
  date: string;
  time: string;
  dateTime: string;
};

export function MonitoringPlanSheet({
  open,
  onOpenChange,
  treatmentId,
  protocol,
  doctorId,
  onSuccess,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<{ rows: MonitoringRow[] }>({
    defaultValues: {
      rows: [
        { sequence: 1, plannedDay: 7, isOvertime: false, appointmentId: null },
        {
          sequence: 2,
          plannedDay: 10,
          isOvertime: false,
          appointmentId: null,
        },
        {
          sequence: 3,
          plannedDay: 13,
          isOvertime: false,
          appointmentId: null,
        },
      ],
    },
  });
  function normalizeExternalSlot(slot: ExternalSlot): SlotItem {
    const m = moment(slot.dateTime);

    return {
      id: slot.id,
      date: m.format("YYYY-MM-DD"),
      time: m.format("HH:mm"),
      dateTime: m.format("YYYY-MM-DD HH:mm"),
    };
  }

  const rows = useWatch({ control: form.control, name: "rows" });

  const stimulationStartDate = protocol?.startDate
    ? moment(protocol.startDate)
    : null;

  const calculatedRows = useMemo(() => {
    if (!stimulationStartDate) return [];
    return rows.map((r) => {
      const estimated = stimulationStartDate.clone().add(r.plannedDay, "days");
      const min = estimated.clone().subtract(1, "day");
      const max = estimated.clone().add(1, "day");
      return { ...r, estimated, min, max };
    });
  }, [rows, stimulationStartDate]);

  const validationErrors = useMemo(() => {
    const errors: Record<number, string> = {};
    rows?.forEach((row, index) => {
      if (index === 0) return;
      const cur = Number(row.plannedDay);
      const prev = Number(rows[index - 1]?.plannedDay);
      if (Number.isFinite(cur) && Number.isFinite(prev) && cur < prev) {
        errors[index] = "El día no puede ser anterior al monitoreo previo";
      }
    });
    return errors;
  }, [rows]);

  const hasErrors = Object.keys(validationErrors).length > 0;

  // slotsCache: sequence -> { loading, items }
  const [slotsCache, setSlotsCache] = useState<
    Record<number, { loading: boolean; items: SlotItem[] }>
  >({});

  async function loadSlotsForRow(
    sequence: number,
    min: moment.Moment,
    max: moment.Moment
  ) {
    if (!doctorId) {
      toast.error("No hay médico responsable asignado al tratamiento.");
      return;
    }

    setSlotsCache((prev) => ({
      ...prev,
      [sequence]: { loading: true, items: prev[sequence]?.items ?? [] },
    }));

    const days: string[] = [];
    const d = min.clone();
    while (d.isSameOrBefore(max, "day")) {
      days.push(d.format("YYYY-MM-DD"));
      d.add(1, "day");
    }

    const merged: SlotItem[] = [];

    for (const day of days) {
      const resp = await getDoctorAvailableSlots({ doctorId, date: day });
      if (!resp.success) continue;

      const list = (resp.data?.data ?? []) as ExternalSlot[];

      for (const slot of list) {
        const norm = normalizeExternalSlot(slot);
        merged.push(norm);
      }
    }

    merged.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

    setSlotsCache((prev) => ({
      ...prev,
      [sequence]: { loading: false, items: merged },
    }));
  }

  function markOvertime(index: number) {
    form.setValue(`rows.${index}.appointmentId`, null);
    form.setValue(`rows.${index}.isOvertime`, true);
    form.setValue(`rows.${index}.overtimeTime`, "08:00"); // default
  }

  function pickSlot(index: number, slot: SlotItem) {
    form.setValue(`rows.${index}.appointmentId`, slot.id);
    form.setValue(`rows.${index}.appointmentDateTime`, slot.dateTime);
    form.setValue(`rows.${index}.isOvertime`, false);
    form.setValue(`rows.${index}.overtimeTime`, null);
  }

  async function onSubmit(data: { rows: MonitoringRow[] }) {
    if (submitting) return;

    setSubmitting(true);

    try {
      for (const r of data.rows) {
        if (!r.isOvertime && !r.appointmentId) {
          toast.error(
            `Falta seleccionar turno u sobreturno en el monitoreo #${r.sequence}`
          );
          return;
        }

        if (r.isOvertime && !r.overtimeTime) {
          toast.error(
            `Falta indicar la hora del sobreturno en el monitoreo #${r.sequence}`
          );
          return;
        }
      }

      const result = await finalizeMonitoringPlans({
        treatmentId,
        rows: data.rows.map((r) => ({
          planId: r.planId,
          appointment: r.isOvertime
            ? undefined
            : {
                id: r.appointmentId!,
                dateTime: r.appointmentDateTime!,
              },
          isOvertime: r.isOvertime,
          plannedDay: r.plannedDay,
          sequence: r.sequence,
        })),
      });

      if (!result.success) {
        toast.error(result.error ?? "No se pudo finalizar el plan");
        return;
      }

      toast.success("Plan de monitoreos confirmado");
      resetAndClose();
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  }

  function resetAndClose() {
    form.reset();
    setSlotsCache({});
    onOpenChange(false);
  }
  function handleClose(open: boolean) {
    if (!open) {
      form.reset();
      setSlotsCache({});
    }
    onOpenChange(open);
  }
  const headerDisabledReason = !stimulationStartDate
    ? "El protocolo no tiene fecha de inicio"
    : !doctorId
      ? "El tratamiento no tiene médico responsable"
      : null;

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Planificación de Monitoreos
          </SheetTitle>
          <SheetDescription>
            Definí los días y seleccioná un turno disponible (±1 día). Si no hay
            disponibilidad, podés marcar sobreturno.
          </SheetDescription>
        </SheetHeader>

        {/* Contexto */}
        <div className="mt-6 rounded-lg border bg-card p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Inicio estimulación
            </span>
            <span>
              {stimulationStartDate
                ? stimulationStartDate.format("DD/MM/YYYY")
                : "—"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Medicamento</span>
            <span>{protocol?.drugName || "—"}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Duración estimada</span>
            <span>{protocol?.duration || "—"}</span>
          </div>

          {headerDisabledReason && (
            <Badge
              variant="secondary"
              className="bg-yellow-100 text-yellow-800"
            >
              {headerDisabledReason}
            </Badge>
          )}
        </div>

        {/* Lista de filas */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {calculatedRows.map((row: any, index: number) => {
            const cache = slotsCache[row.sequence];
            const items = cache?.items ?? [];
            const loading = cache?.loading ?? false;

            const selectedId = rows[index]?.appointmentId ?? null;
            const isOvertime = rows[index]?.isOvertime ?? false;

            return (
              <div key={row.sequence} className="rounded-xl border bg-card p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-sm">
                      Monitoreo #{row.sequence}
                    </Badge>

                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">Día</span>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        className="w-24"
                        disabled={
                          !stimulationStartDate ||
                          loading ||
                          !!selectedId ||
                          isOvertime
                        }
                        aria-invalid={!!validationErrors[index]}
                        {...form.register(`rows.${index}.plannedDay`, {
                          valueAsNumber: true,
                          onChange: (e) => {
                            let v = Number(e.target.value);
                            if (Number.isNaN(v)) return;
                            if (v < 1) v = 1;
                            if (v > 20) v = 20;
                            form.setValue(`rows.${index}.plannedDay`, v, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          },
                        })}
                      />
                      {(selectedId || isOvertime) && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Para cambiar el día, quitá el turno o el sobreturno
                        </div>
                      )}
                    </div>

                    <div className="text-sm">
                      <div className="text-muted-foreground">Ventana</div>
                      <div className="font-medium">
                        {row.min.format("DD/MM")} – {row.max.format("DD/MM")}
                        <span className="text-muted-foreground">
                          {" "}
                          (estimado {row.estimated.format("DD/MM")})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!doctorId || !stimulationStartDate || loading}
                      onClick={() =>
                        loadSlotsForRow(row.sequence, row.min, row.max)
                      }
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Cargando…
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 mr-2" />
                          Ver turnos
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant={isOvertime ? "destructive" : "outline"}
                      disabled={!doctorId || !stimulationStartDate}
                      onClick={() => markOvertime(index)}
                    >
                      Sobreturno
                    </Button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  {isOvertime ? (
                    <Badge className="bg-red-100 text-red-700 border-red-200">
                      Sobreturno confirmado
                    </Badge>
                  ) : selectedId ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Turno seleccionado
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Pendiente de selección</Badge>
                  )}
                </div>
                {isOvertime && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">
                      Hora sobreturno:
                    </span>
                    <Input
                      type="time"
                      min="08:00"
                      max="18:00"
                      className="w-32"
                      value={rows[index]?.overtimeTime ?? ""}
                      onChange={(e) =>
                        form.setValue(
                          `rows.${index}.overtimeTime`,
                          e.target.value,
                          {
                            shouldDirty: true,
                          }
                        )
                      }
                    />
                  </div>
                )}

                {validationErrors[index] && (
                  <div className="mt-2 text-xs text-red-600">
                    {validationErrors[index]}
                  </div>
                )}

                {/* Slots chips */}
                <div className="mt-4">
                  {items.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      {loading
                        ? "Cargando turnos disponibles…"
                        : "Sin turnos cargados aún. Tocá “Ver turnos” para listar los disponibles."}
                      {isOvertime && (
                        <div className="mt-2">
                          <Badge className="bg-red-100 text-red-700 border-red-200">
                            Marcado como sobreturno
                          </Badge>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {items.map((s) => {
                        const selected = selectedId === s.id && !isOvertime;
                        return (
                          <Button
                            key={s.id}
                            type="button"
                            size="sm"
                            variant={selected ? "default" : "outline"}
                            onClick={() => pickSlot(index, s)}
                          >
                            {moment(s.date).format("DD/MM")}-{s.time}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div className="text-sm text-muted-foreground">
            Al confirmar, los turnos seleccionados quedarán reservados para el
            paciente.
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={resetAndClose}
              disabled={submitting}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={
                submitting || hasErrors || !stimulationStartDate || !doctorId
              }
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Reservando…
                </>
              ) : (
                "Confirmar y reservar turnos"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
