"use client";

import { useMemo } from "react";
import moment from "moment";
import { useForm } from "react-hook-form";
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

  const rows = form.watch("rows");

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
    // TODO: conectar con MonitoringPlanService
    console.log("Monitoring plan:", data, treatmentId);
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
                  {...form.register(`rows.${index}.plannedDay`, {
                    valueAsNumber: true,
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
            <Button type="submit">Guardar planificación</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
