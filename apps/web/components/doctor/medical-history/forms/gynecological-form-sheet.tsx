"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  GynecologicalHistorySchema,
  GynecologicalHistory,
  CycleRegularity,
} from "@repo/contracts";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/sheet";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
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
import { upsertGynecological } from "@/app/actions/medical-history/gynecological";

interface GynecologicalFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gynecologicalHistory?: GynecologicalHistory | null;
  medicalHistoryId: number;
  partnerDataId?: number | null;
  onSuccess: () => void;
}

type FormValues = z.infer<typeof GynecologicalHistorySchema>;

export function GynecologicalFormSheet({
  open,
  onOpenChange,
  gynecologicalHistory,
  medicalHistoryId,
  partnerDataId,
  onSuccess,
}: GynecologicalFormSheetProps) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(GynecologicalHistorySchema),
    defaultValues: {
      id: gynecologicalHistory?.id,
      partnerData: null,
      menarcheAge: gynecologicalHistory?.menarcheAge || null,
      cycleRegularity: gynecologicalHistory?.cycleRegularity || null,
      cycleDurationDays: gynecologicalHistory?.cycleDurationDays || null,
      bleedingCharacteristics: gynecologicalHistory?.bleedingCharacteristics || null,
      gestations: gynecologicalHistory?.gestations || null,
      births: gynecologicalHistory?.births || null,
      abortions: gynecologicalHistory?.abortions || null,
      ectopicPregnancies: gynecologicalHistory?.ectopicPregnancies || null,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        id: gynecologicalHistory?.id,
        partnerData: null,
        menarcheAge: gynecologicalHistory?.menarcheAge || null,
        cycleRegularity: gynecologicalHistory?.cycleRegularity || null,
        cycleDurationDays: gynecologicalHistory?.cycleDurationDays || null,
        bleedingCharacteristics:
          gynecologicalHistory?.bleedingCharacteristics || null,
        gestations: gynecologicalHistory?.gestations || null,
        births: gynecologicalHistory?.births || null,
        abortions: gynecologicalHistory?.abortions || null,
        ectopicPregnancies: gynecologicalHistory?.ectopicPregnancies || null,
      });
    }
  }, [open, gynecologicalHistory, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      await upsertGynecological({
        medicalHistoryId,
        gynecologicalHistory: data,
      });

      queryClient.invalidateQueries({ queryKey: ["medicalHistory"] });
      toast.success("Historia ginecológica guardada correctamente");
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al guardar historia ginecológica"
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar Antecedentes Ginecológicos</SheetTitle>
          <SheetDescription>
            Actualiza la información ginecológica del paciente
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-6"
          >
            {/* Menarca */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">MENARCA</h3>

              <FormField
                control={form.control}
                name="menarcheAge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Edad de primera menstruación</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="8"
                        max="20"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        placeholder="Ej: 12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Ciclos Menstruales */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">CICLOS MENSTRUALES</h3>

              <FormField
                control={form.control}
                name="cycleRegularity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Regularidad</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione regularidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={CycleRegularity.REGULAR}>
                          Regular
                        </SelectItem>
                        <SelectItem value={CycleRegularity.IRREGULAR}>
                          Irregular
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cycleDurationDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración del ciclo (días)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="20"
                        max="40"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        placeholder="Ej: 28"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bleedingCharacteristics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Características del sangrado</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="Ej: Normal, sin coágulos"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Historial Obstétrico */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">HISTORIAL OBSTÉTRICO</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gestations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>G (Embarazos)</FormLabel>
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

                <FormField
                  control={form.control}
                  name="births"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>P (Partos)</FormLabel>
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

                <FormField
                  control={form.control}
                  name="abortions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AB (Abortos)</FormLabel>
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

                <FormField
                  control={form.control}
                  name="ectopicPregnancies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ST (Ectópicos)</FormLabel>
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
              </div>
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
