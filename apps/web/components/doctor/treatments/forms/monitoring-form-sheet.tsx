"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@repo/ui/sheet";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Textarea } from "@repo/ui/textarea";
import { useForm } from "react-hook-form";
import { toast } from "@repo/ui";
import { createMonitoring } from "@/app/actions/doctor/treatments/create-monitoring";
import { cancelMonitoringPlan } from "@/app/actions/doctor/treatments/cancel-monitoring-plan";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function MonitoringFormSheet({
  open,
  onOpenChange,
  treatmentId,
  monitoringPlan,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  treatmentId: number;
  monitoringPlan: any | null;
  onSuccess: () => void;
}) {
  const form = useForm();
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (
    !monitoringPlan ||
    monitoringPlan.status === "COMPLETED" ||
    monitoringPlan.deletedAt
  ) {
    return null;
  }

  async function onSubmit(data: any) {
    setSaving(true);

    const payload = {
      ...data,
      monitoringPlanId: monitoringPlan.id,
    };

    const res = await createMonitoring(treatmentId, payload);

    setSaving(false);

    if (!res.success) {
      toast.error(res.error);
      return;
    }

    toast.success("Monitoreo registrado");
    onSuccess();
    onOpenChange(false);
  }

  async function onCancelPlan() {
    setCancelling(true);

    const res = await cancelMonitoringPlan(monitoringPlan.id);

    setCancelling(false);

    if (!res.success) {
      toast.error(res.error);
      return;
    }

    toast.success("Monitoreo cancelado");
    onSuccess();
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            Registrar Monitoreo – Día {monitoringPlan.plannedDay}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div>
            <label className="text-sm font-medium">Fecha del monitoreo</label>
            <Input
              type="date"
              min={monitoringPlan.minDate}
              max={monitoringPlan.maxDate}
              {...form.register("monitoringDate", { required: true })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Día del tratamiento</label>
            <Input
              type="number"
              {...form.register("dayNumber", { valueAsNumber: true })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Cantidad de folículos</label>
            <Input
              type="number"
              {...form.register("follicleCount", { valueAsNumber: true })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Tamaño de folículos</label>
            <Input {...form.register("follicleSize")} />
          </div>

          <div>
            <label className="text-sm font-medium">Estradiol (pg/ml)</label>
            <Input
              type="number"
              step="0.01"
              {...form.register("estradiolLevel", { valueAsNumber: true })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Observaciones</label>
            <Textarea {...form.register("observations")} />
          </div>

          <div className="flex justify-between gap-2 pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={onCancelPlan}
              disabled={cancelling || saving}
            >
              {cancelling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Cancelar turno
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving || cancelling}
              >
                Cerrar
              </Button>
              <Button type="submit" disabled={saving || cancelling}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Guardar
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
