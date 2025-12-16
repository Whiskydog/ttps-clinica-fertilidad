"use client";

import { useMemo } from "react";
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
import { Activity } from "lucide-react";
import { createMonitoringPlans } from "@/app/actions/doctor/monitoring-plans/create";
import { toast } from "@repo/ui";

type MonitoringRow = {
  sequence: number;
  plannedDay: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatmentId: number;
  protocol: any;
  onSuccess: () => void;
};

export function MonitoringPlanSheet({
  open,
  onOpenChange,
  treatmentId,
  protocol,
  onSuccess,
}: Props) {
  const form = useForm<{ rows: MonitoringRow[] }>({
    defaultValues: {
      rows: [
        { sequence: 1, plannedDay: 7 },
        { sequence: 2, plannedDay: 10 },
        { sequence: 3, plannedDay: 13 },
      ],
    },
  });

  const rows = useWatch({
    control: form.control,
    name: "rows",
  });
  const validationErrors = useMemo(() => {
    const errors: Record<number, string> = {};

    rows?.forEach((row, index) => {
      if (index === 0) return;

      const current = Number(row?.plannedDay);
      const prev = Number(rows[index - 1]?.plannedDay);

      if (Number.isFinite(current) && Number.isFinite(prev) && current < prev) {
        errors[index] = "El día no puede ser anterior al monitoreo previo";
      }
    });

    return errors;
  }, [rows]);

  const hasErrors = Object.keys(validationErrors).length > 0;

  const stimulationStartDate = protocol?.startDate
    ? moment(protocol.startDate)
    : null;

  const calculatedRows = useMemo(() => {
    if (!stimulationStartDate) return [];

    return rows.map((row) => {
      const estimated = stimulationStartDate
        .clone()
        .add(row.plannedDay, "days");
      const min = estimated.clone().subtract(1, "days");
      const max = estimated.clone().add(1, "days");

      return {
        ...row,
        estimated,
        min,
        max,
      };
    });
  }, [rows, stimulationStartDate]);

  const onSubmit = async (data: { rows: MonitoringRow[] }) => {
    const result = await createMonitoringPlans({
      treatmentId,
      rows: data.rows,
    });

    if (!result.success) {
      toast.error("No se pudo crear el plan de monitoreos");
      return;
    }

    toast.success("Plan de monitoreos creado correctamente");

    onSuccess();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Planificación de Monitoreos
          </SheetTitle>
          <SheetDescription>
            Definí los controles de la estimulación ovárica. El paciente podrá
            elegir turnos dentro del rango permitido.
          </SheetDescription>
        </SheetHeader>

        {/* Contexto del protocolo */}
        <div className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Inicio estimulación</span>
            <span>
              {stimulationStartDate
                ? stimulationStartDate.format("DD/MM/YYYY")
                : "No definido"}
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

          {!stimulationStartDate && (
            <Badge
              variant="secondary"
              className="bg-yellow-100 text-yellow-800"
            >
              El protocolo no tiene fecha de inicio
            </Badge>
          )}
        </div>

        {/* Tabla */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div className="grid grid-cols-5 gap-2 text-xs font-semibold text-muted-foreground">
            <div>#</div>
            <div>Día</div>
            <div>Estimado</div>
            <div>Desde</div>
            <div>Hasta</div>
          </div>

          {rows.map((row, index) => {
            const calculated = calculatedRows[index];

            return (
              <div
                key={row.sequence}
                className="grid grid-cols-5 gap-2 items-center"
              >
                <div>{row.sequence}</div>

                <Input
                  type="number"
                  min={1}
                  max={31}
                  aria-invalid={!!validationErrors[index]}
                  className={
                    validationErrors[index]
                      ? "!border-red-500 focus-visible:!ring-red-500"
                      : ""
                  }
                  {...form.register(`rows.${index}.plannedDay`, {
                    valueAsNumber: true,
                    onChange: (e) => {
                      let value = Number(e.target.value);

                      if (Number.isNaN(value)) return;

                      if (value < 1) value = 1;
                      if (value > 31) value = 31;

                      form.setValue(`rows.${index}.plannedDay`, value, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    },
                  })}
                />

                <div className="text-sm">
                  {calculated?.estimated
                    ? calculated.estimated.format("DD/MM")
                    : "—"}
                </div>

                <div className="text-sm">
                  {calculated?.min ? calculated.min.format("DD/MM") : "—"}
                </div>

                <div className="text-sm">
                  {calculated?.max ? calculated.max.format("DD/MM") : "—"}
                </div>
                {validationErrors[index] && (
                  <div className="col-span-4 text-xs text-red-600">
                    {validationErrors[index]}
                  </div>
                )}
              </div>
            );
          })}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={hasErrors || !stimulationStartDate}>
              Guardar planificación
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
