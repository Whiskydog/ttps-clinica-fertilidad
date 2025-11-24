"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UpdateMedicalHistorySchema } from "@repo/contracts";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/sheet";
import { Button } from "@repo/ui/button";
import { Textarea } from "@repo/ui/textarea";
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
import { updateMedicalHistory } from "@/app/actions/medical-history/update";

interface FamilyBackgroundsFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyBackgrounds?: string | null;
  medicalHistoryId: number;
  onSuccess: () => void;
}

type FormValues = z.infer<typeof UpdateMedicalHistorySchema>;

export function FamilyBackgroundsFormSheet({
  open,
  onOpenChange,
  familyBackgrounds,
  medicalHistoryId,
  onSuccess,
}: FamilyBackgroundsFormSheetProps) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(UpdateMedicalHistorySchema),
    defaultValues: {
      id: medicalHistoryId,
      familyBackgrounds: familyBackgrounds || null,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        id: medicalHistoryId,
        familyBackgrounds: familyBackgrounds || null,
      });
    }
  }, [open, familyBackgrounds, medicalHistoryId, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      await updateMedicalHistory(data);

      queryClient.invalidateQueries({ queryKey: ["medicalHistory"] });
      toast.success("Antecedentes familiares guardados correctamente");
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al guardar antecedentes familiares"
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar Antecedentes Familiares</SheetTitle>
          <SheetDescription>
            Actualiza la información sobre antecedentes familiares del paciente
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-6"
          >
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">ANTECEDENTES FAMILIARES</h3>

              <FormField
                control={form.control}
                name="familyBackgrounds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción detallada</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        placeholder="Ejemplo:&#10;Padre: Diabetes, hipertensión&#10;Madre: Hipotiroidismo, cáncer de mama&#10;Hermanos: Sin antecedentes relevantes&#10;Abuelos paternos: Cardiopatía&#10;Abuelos maternos: Infertilidad (abuela)"
                        rows={10}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-2">
                      Incluya información relevante de padres, hermanos, abuelos y
                      otros familiares directos.
                    </p>
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
