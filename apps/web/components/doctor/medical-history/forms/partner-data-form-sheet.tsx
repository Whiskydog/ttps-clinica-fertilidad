"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PartnerData,
  PartnerDataSchema,
  BiologicalSex,
  CycleRegularity,
  GynecologicalHistorySchema,
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
  FormDescription,
} from "@repo/ui/form";
import { toast } from "@repo/ui";
import { useQueryClient } from "@tanstack/react-query";
import { upsertPartner } from "@/app/actions/medical-history/partner";

interface PartnerDataFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerData?: PartnerData | null;
  medicalHistoryId: number;
  onSuccess: () => void;
}

// Extended schema for the form including gynecological history
const PartnerFormSchema = z.object({
  // Basic partner data
  firstName: z.string().min(1, "Nombre requerido").max(100),
  lastName: z.string().min(1, "Apellido requerido").max(100),
  dni: z.string().min(1, "DNI requerido").max(20),
  birthDate: z.string().min(1, "Fecha de nacimiento requerida"),
  occupation: z.string().max(100).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  email: z
    .string()
    .email("Email inválido")
    .max(255)
    .optional()
    .or(z.literal(""))
    .nullable(),
  biologicalSex: z.nativeEnum(BiologicalSex, {
    error: "Sexo biológico requerido",
  }),
  genitalBackgrounds: z.string().nullable().optional(),
  // Gynecological history (for female partners - ROPA)
  menarcheAge: z.number().int().nullable().optional(),
  cycleRegularity: z.nativeEnum(CycleRegularity).nullable().optional(),
  cycleDurationDays: z.number().int().nullable().optional(),
  bleedingCharacteristics: z.string().nullable().optional(),
  gestations: z.number().int().nullable().optional(),
  births: z.number().int().nullable().optional(),
  abortions: z.number().int().nullable().optional(),
  ectopicPregnancies: z.number().int().nullable().optional(),
});

type FormValues = z.infer<typeof PartnerFormSchema>;

export function PartnerDataFormSheet({
  open,
  onOpenChange,
  partnerData,
  medicalHistoryId,
  onSuccess,
}: PartnerDataFormSheetProps) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(PartnerFormSchema),
    defaultValues: {
      firstName: partnerData?.firstName || "",
      lastName: partnerData?.lastName || "",
      dni: partnerData?.dni || "",
      birthDate: partnerData?.birthDate || "",
      occupation: partnerData?.occupation || null,
      phone: partnerData?.phone || null,
      email: partnerData?.email || null,
      biologicalSex: partnerData?.biologicalSex || BiologicalSex.MALE,
      genitalBackgrounds: partnerData?.genitalBackgrounds || null,
      menarcheAge: null,
      cycleRegularity: null,
      cycleDurationDays: null,
      bleedingCharacteristics: null,
      gestations: null,
      births: null,
      abortions: null,
      ectopicPregnancies: null,
    },
  });

  const watchBiologicalSex = form.watch("biologicalSex");

  useEffect(() => {
    if (open) {
      form.reset({
        firstName: partnerData?.firstName || "",
        lastName: partnerData?.lastName || "",
        dni: partnerData?.dni || "",
        birthDate: partnerData?.birthDate || "",
        occupation: partnerData?.occupation || null,
        phone: partnerData?.phone || null,
        email: partnerData?.email || null,
        biologicalSex: partnerData?.biologicalSex || BiologicalSex.MALE,
        genitalBackgrounds: partnerData?.genitalBackgrounds || null,
        menarcheAge: null,
        cycleRegularity: null,
        cycleDurationDays: null,
        bleedingCharacteristics: null,
        gestations: null,
        births: null,
        abortions: null,
        ectopicPregnancies: null,
      });
    }
  }, [open, partnerData, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      // Build partner data payload
      const partnerPayload: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        dni: data.dni,
        birthDate: data.birthDate, // YYYY-MM-DD format
        occupation: data.occupation,
        phone: data.phone,
        email: data.email || null,
        biologicalSex: data.biologicalSex,
      };

      // Add genital backgrounds if male
      if (data.biologicalSex === BiologicalSex.MALE) {
        partnerPayload.genitalBackgrounds = data.genitalBackgrounds;
      }

      // Build upsert payload
      const payload: any = {
        medicalHistoryId,
        partnerData: partnerPayload,
      };

      // Add gynecological history if female (ROPA)
      if (data.biologicalSex === BiologicalSex.FEMALE) {
        payload.gynecologicalHistory = {
          menarcheAge: data.menarcheAge,
          cycleRegularity: data.cycleRegularity,
          cycleDurationDays: data.cycleDurationDays,
          bleedingCharacteristics: data.bleedingCharacteristics,
          gestations: data.gestations,
          births: data.births,
          abortions: data.abortions,
          ectopicPregnancies: data.ectopicPregnancies,
        };
      }

      await upsertPartner(payload);

      queryClient.invalidateQueries({ queryKey: ["medicalHistory"] });
      queryClient.invalidateQueries({ queryKey: ["treatmentDetail"] });
      toast.success("Datos de pareja guardados correctamente");
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al guardar datos de pareja"
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle>
            {partnerData ? "Editar" : "Agregar"} Datos de la Pareja
          </SheetTitle>
          <SheetDescription>
            Complete la información de la pareja del paciente
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-6"
          >
            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">INFORMACIÓN BÁSICA</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre 🞲</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ej: Juan" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido 🞲</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ej: Pérez" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dni"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DNI 🞲</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ej: 12345678" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de nacimiento 🞲</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="biologicalSex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sexo biológico 🞲</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione sexo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={BiologicalSex.MALE}>
                            Masculino
                          </SelectItem>
                          <SelectItem value={BiologicalSex.FEMALE}>
                            Femenino (ROPA)
                          </SelectItem>
                          <SelectItem value={BiologicalSex.INTERSEX}>
                            Intersex
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ocupación</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="Ej: Ingeniero"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          type="tel"
                          placeholder="Ej: +54 11 1234-5678"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          type="email"
                          placeholder="Ej: email@example.com"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Antecedentes genitales (solo para masculino) */}
            {watchBiologicalSex === BiologicalSex.MALE && (
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">
                  ANTECEDENTES GENITALES
                </h3>

                <FormField
                  control={form.control}
                  name="genitalBackgrounds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Antecedentes genitales</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          placeholder="Describa cualquier antecedente genital relevante..."
                          rows={4}
                        />
                      </FormControl>
                      <FormDescription>
                        Incluya información sobre cirugías, infecciones,
                        varicocele, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Historia ginecológica (solo para femenino - ROPA) */}
            {watchBiologicalSex === BiologicalSex.FEMALE && (
              <div className="space-y-4 bg-pink-50 p-4 rounded-lg">
                <h3 className="font-semibold text-sm">
                  HISTORIA GINECOLÓGICA (ROPA)
                </h3>

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

                <FormField
                  control={form.control}
                  name="cycleRegularity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Regularidad del ciclo</FormLabel>
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

                <h4 className="font-semibold text-xs mt-4">
                  HISTORIAL OBSTÉTRICO
                </h4>

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
            )}

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
