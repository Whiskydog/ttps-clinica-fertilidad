"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UpdateHabitsSchema, Habits } from "@repo/contracts";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/sheet";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/form";
import { toast } from "@repo/ui";
import { useQueryClient } from "@tanstack/react-query";
import { updateHabits } from "@/app/actions/doctor/medical-history/update-habits";

interface HabitsFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habits?: Habits | null;
  medicalHistoryId: number;
  onSuccess: () => void;
}

type FormValues = z.infer<typeof UpdateHabitsSchema>;

export function HabitsFormSheet({
  open,
  onOpenChange,
  habits,
  medicalHistoryId,
  onSuccess,
}: HabitsFormSheetProps) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(UpdateHabitsSchema),
    defaultValues: {
      id: habits?.id,
      medicalHistoryId,
      cigarettesPerDay: habits?.cigarettesPerDay || null,
      yearsSmoking: habits?.yearsSmoking || null,
      packDaysValue: habits?.packDaysValue || null,
      alcoholConsumption: habits?.alcoholConsumption || null,
      recreationalDrugs: habits?.recreationalDrugs || null,
    },
  });

  useEffect(() => {
    if (open && habits) {
      form.reset({
        id: habits.id,
        medicalHistoryId,
        cigarettesPerDay: habits.cigarettesPerDay || null,
        yearsSmoking: habits.yearsSmoking || null,
        packDaysValue: habits.packDaysValue || null,
        alcoholConsumption: habits.alcoholConsumption || null,
        recreationalDrugs: habits.recreationalDrugs || null,
      });
    }
  }, [open, habits, medicalHistoryId, form]);

  // Calculate pack-days value automatically
  const cigarettes = form.watch("cigarettesPerDay");
  const years = form.watch("yearsSmoking");

  useEffect(() => {
    if (
      cigarettes !== null &&
      years !== null &&
      !!cigarettes &&
      !!years &&
      cigarettes > 0 &&
      years > 0
    ) {
      const packDays = (cigarettes * years) / 20;
      form.setValue("packDaysValue", packDays);
    } else if (cigarettes === 0 || !cigarettes) {
      form.setValue("packDaysValue", null);
    }
  }, [cigarettes, years, form]);

  const onSubmit = async (data: FormValues) => {
    const result = await updateHabits(data);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["medicalHistory"] });
    toast.success("Hábitos guardados correctamente");
    onSuccess();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar Hábitos y Factores de Riesgo</SheetTitle>
          <SheetDescription>
            Actualiza la información sobre hábitos del paciente
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-6"
          >
            {/* Tabaquismo */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">TABAQUISMO</h3>

              <FormField
                control={form.control}
                name="cigarettesPerDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cigarrillos por día</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(cigarettes || 0) > 0 && (
                <>
                  <FormField
                    control={form.control}
                    name="yearsSmoking"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Años fumando</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label>Pack-Días (calculado automáticamente)</Label>
                    <Input
                      type="number"
                      value={(() => {
                        const packDays = form.watch("packDaysValue");
                        return packDays !== null && packDays !== undefined
                          ? packDays
                          : "0";
                      })()}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Fórmula: (Cigarrillos/día × Años) / 20
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Consumo de Alcohol */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">CONSUMO DE ALCOHOL</h3>

              <FormField
                control={form.control}
                name="alcoholConsumption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frecuencia</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione frecuencia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Nunca">Nunca</SelectItem>
                        <SelectItem value="Ocasional">Ocasional</SelectItem>
                        <SelectItem value="Frecuente">Frecuente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Drogas Recreativas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">DROGAS RECREATIVAS</h3>

              <FormField
                control={form.control}
                name="recreationalDrugs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especificar (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="Cannabis, Cocaína, Otras..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="flex-1"
              >
                {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
