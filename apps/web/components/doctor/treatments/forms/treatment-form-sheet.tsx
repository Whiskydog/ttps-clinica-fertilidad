"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  UpdateTreatmentSchema,
  InitialObjective,
  TreatmentStatus,
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
import { Textarea } from "@repo/ui/textarea";
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
import { updateTreatment } from "@/app/actions/doctor/treatments/update-treatment";
import { normalizeDateForInput } from "@/lib/upload-utils";

interface Treatment {
  id: number;
  initialObjective: InitialObjective;
  startDate?: string;
  status: TreatmentStatus;
  closureReason?: string;
  closureDate?: string;
}

interface TreatmentFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatment: Treatment;
  onSuccess: () => void;
}

type FormValues = z.infer<typeof UpdateTreatmentSchema>;

export function TreatmentFormSheet({
  open,
  onOpenChange,
  treatment,
  onSuccess,
}: TreatmentFormSheetProps) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(UpdateTreatmentSchema),
    defaultValues: {
      id: treatment?.id,
      initialObjective: treatment?.initialObjective,
      startDate: normalizeDateForInput(treatment?.startDate),
      status: treatment?.status,
      closureReason: treatment?.closureReason || null,
      closureDate: normalizeDateForInput(treatment?.closureDate),
    },
  });

  useEffect(() => {
    if (open && treatment) {
      form.reset({
        id: treatment.id,
        initialObjective: treatment.initialObjective,
        startDate: normalizeDateForInput(treatment.startDate),
        status: treatment.status,
        closureReason: treatment.closureReason || null,
        closureDate: normalizeDateForInput(treatment.closureDate),
      });
    }
  }, [open, treatment, form]);

  const status = form.watch("status");

  const onSubmit = async (data: FormValues) => {
    try {
      const result = await updateTreatment(data);

      if (!result.success) {
        throw new Error(result.error);
      }

      queryClient.invalidateQueries({ queryKey: ["treatmentDetail"] });
      toast.success("Tratamiento actualizado correctamente");
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al actualizar el tratamiento"
      );
    }
  };

  const getObjectiveLabel = (objective: InitialObjective) => {
    const labels: Record<InitialObjective, string> = {
      [InitialObjective.gametos_propios]: "Gametos Propios",
      [InitialObjective.couple_female]: "Pareja Femenina",
      [InitialObjective.method_ropa]: "Método ROPA",
      [InitialObjective.woman_single]: "Mujer Sola",
      [InitialObjective.preservation_ovocytes_embryos]:
        "Preservación de Ovocitos/Embriones",
    };
    return labels[objective];
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar Tratamiento</SheetTitle>
          <SheetDescription>
            Actualiza la información general del tratamiento
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-6"
          >
            <FormField
              control={form.control}
              name="initialObjective"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objetivo del Tratamiento 🞲</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione objetivo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(InitialObjective).map((objective) => (
                        <SelectItem key={objective} value={objective}>
                          {getObjectiveLabel(objective)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Inicio</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado del Tratamiento</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={TreatmentStatus.vigente}>
                        Vigente
                      </SelectItem>
                      <SelectItem value={TreatmentStatus.completed}>
                        Completado
                      </SelectItem>
                      <SelectItem value={TreatmentStatus.closed}>
                        Cerrado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {status === TreatmentStatus.closed && (
              <>
                <FormField
                  control={form.control}
                  name="closureDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Cierre 🞲</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="closureReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razón de Cierre 🞲</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          placeholder="Describa la razón del cierre del tratamiento..."
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

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
