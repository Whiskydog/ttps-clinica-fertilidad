"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  UpdateMedicalHistorySchema,
  Fenotype,
  UpdateFenotypeSchema,
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
import { updateMedicalHistory } from "@/app/actions/medical-history/update";
import { updateFenotype } from "@/app/actions/medical-history/update-fenotype";
import {
  getPhenotypeEnums,
  PhenotypeEnumsResponse,
} from "@/app/actions/medical-history/get-phenotype-enums";

// Función para formatear valores de enum a labels legibles
function formatEnumLabel(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .replace("Castanio", "Castaño");
}

// Función para renderizar opciones del Select solo con valores del API externa
function renderSelectOptions(
  enumValues: string[] | undefined
): React.ReactNode {
  if (!enumValues) return null;

  return enumValues.map((value) => (
    <SelectItem key={value} value={value}>
      {formatEnumLabel(value)}
    </SelectItem>
  ));
}

interface PhysicalExamFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fenotype: Fenotype; // Always exists (created with medical history)
  physicalExamNotes?: string | null;
  medicalHistoryId: number;
  onSuccess: () => void;
}

type FormValues = z.infer<typeof UpdateMedicalHistorySchema>;

export function PhysicalExamFormSheet({
  open,
  onOpenChange,
  fenotype,
  physicalExamNotes,
  medicalHistoryId,
  onSuccess,
}: PhysicalExamFormSheetProps) {
  const queryClient = useQueryClient();
  const [phenotypeEnums, setPhenotypeEnums] =
    useState<PhenotypeEnumsResponse | null>(null);
  const [loadingEnums, setLoadingEnums] = useState(false);

  // Cargar enums de fenotipos al abrir el formulario
  useEffect(() => {
    if (open && !phenotypeEnums) {
      setLoadingEnums(true);
      getPhenotypeEnums()
        .then((result) => {
          if (result.success && result.data) {
            setPhenotypeEnums(result.data);
          } else {
            toast.error(
              result.error || "Error al cargar opciones de fenotipo"
            );
          }
        })
        .finally(() => setLoadingEnums(false));
    }
  }, [open, phenotypeEnums]);

  const form = useForm<FormValues>({
    resolver: zodResolver(UpdateMedicalHistorySchema),
    defaultValues: {
      id: medicalHistoryId,
      physicalExamNotes: physicalExamNotes || null,
    },
  });

  // Separate form for fenotype (always update)
  type FenotypeFormValues = z.infer<typeof UpdateFenotypeSchema>;

  const fenotypeForm = useForm<FenotypeFormValues>({
    resolver: zodResolver(UpdateFenotypeSchema),
    defaultValues: {
      id: fenotype.id,
      eyeColor: fenotype.eyeColor || null,
      hairColor: fenotype.hairColor || null,
      hairType: fenotype.hairType || null,
      height: fenotype.height || null,
      complexion: fenotype.complexion || null,
      ethnicity: fenotype.ethnicity || null,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        id: medicalHistoryId,
        physicalExamNotes: physicalExamNotes || null,
      });

      fenotypeForm.reset({
        id: fenotype.id,
        eyeColor: fenotype.eyeColor || null,
        hairColor: fenotype.hairColor || null,
        hairType: fenotype.hairType || null,
        height: fenotype.height || null,
        complexion: fenotype.complexion || null,
        ethnicity: fenotype.ethnicity || null,
      });
    }
  }, [open, physicalExamNotes, medicalHistoryId, fenotype, form, fenotypeForm]);

  const onSubmit = async () => {
    try {
      // Save physical exam notes
      const notesData = form.getValues();
      await updateMedicalHistory(notesData);

      // Save fenotype data
      const fenotypeData = fenotypeForm.getValues();
      const fenotypeResult = await updateFenotype(fenotypeData);

      if (!fenotypeResult.success) {
        toast.error(fenotypeResult.error || "Error al guardar fenotipo");
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["medicalHistory"] });
      toast.success("Examen físico y fenotipo guardados correctamente");
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al guardar examen físico"
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar Examen Físico</SheetTitle>
          <SheetDescription>
            Actualiza las notas del examen físico del paciente
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form className="space-y-6 mt-6">
            {/* Notas de Examen Físico */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">NOTAS DE EXAMEN FÍSICO</h3>

              <FormField
                control={form.control}
                name="physicalExamNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        placeholder="Agregue observaciones sobre el examen físico..."
                        rows={8}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        {/* Fenotype Form */}
        <Form {...fenotypeForm}>
          <form className="space-y-6 mt-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">FENOTIPO</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={fenotypeForm.control}
                  name="eyeColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color de ojos</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                        disabled={loadingEnums}
                      >
                        <FormControl>
                          <SelectTrigger>
                            {field.value ? (
                              <span>{formatEnumLabel(field.value)}</span>
                            ) : (
                              <SelectValue
                                placeholder={
                                  loadingEnums ? "Cargando..." : "Seleccione color"
                                }
                              />
                            )}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {renderSelectOptions(
                            phenotypeEnums?.enums?.eye_color?.values
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={fenotypeForm.control}
                  name="hairColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color de cabello</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                        disabled={loadingEnums}
                      >
                        <FormControl>
                          <SelectTrigger>
                            {field.value ? (
                              <span>{formatEnumLabel(field.value)}</span>
                            ) : (
                              <SelectValue
                                placeholder={
                                  loadingEnums ? "Cargando..." : "Seleccione color"
                                }
                              />
                            )}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {renderSelectOptions(
                            phenotypeEnums?.enums?.hair_color?.values
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={fenotypeForm.control}
                  name="hairType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de cabello</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                        disabled={loadingEnums}
                      >
                        <FormControl>
                          <SelectTrigger>
                            {field.value ? (
                              <span>{formatEnumLabel(field.value)}</span>
                            ) : (
                              <SelectValue
                                placeholder={
                                  loadingEnums ? "Cargando..." : "Seleccione tipo"
                                }
                              />
                            )}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {renderSelectOptions(
                            phenotypeEnums?.enums?.hair_type?.values
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={fenotypeForm.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Altura (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="100"
                          max="250"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                          placeholder="Ej: 170"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={fenotypeForm.control}
                  name="complexion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complexión</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                        disabled={loadingEnums}
                      >
                        <FormControl>
                          <SelectTrigger>
                            {field.value ? (
                              <span>{formatEnumLabel(field.value)}</span>
                            ) : (
                              <SelectValue
                                placeholder={
                                  loadingEnums
                                    ? "Cargando..."
                                    : "Seleccione complexión"
                                }
                              />
                            )}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {renderSelectOptions(
                            phenotypeEnums?.enums?.complexion?.values
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={fenotypeForm.control}
                  name="ethnicity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Etnia</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                        disabled={loadingEnums}
                      >
                        <FormControl>
                          <SelectTrigger>
                            {field.value ? (
                              <span>{formatEnumLabel(field.value)}</span>
                            ) : (
                              <SelectValue
                                placeholder={
                                  loadingEnums ? "Cargando..." : "Seleccione etnia"
                                }
                              />
                            )}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {renderSelectOptions(
                            phenotypeEnums?.enums?.ethnicity?.values
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={onSubmit}
                disabled={
                  form.formState.isSubmitting ||
                  fenotypeForm.formState.isSubmitting
                }
                className="flex-1"
              >
                {form.formState.isSubmitting ||
                fenotypeForm.formState.isSubmitting
                  ? "Guardando..."
                  : "Guardar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={
                  form.formState.isSubmitting ||
                  fenotypeForm.formState.isSubmitting
                }
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
