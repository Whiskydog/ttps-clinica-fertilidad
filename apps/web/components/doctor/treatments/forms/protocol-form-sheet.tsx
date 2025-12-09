"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CreateMedicationProtocolSchema,
  UpdateMedicationProtocolSchema,
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
import { Label } from "@repo/ui/label";
import { Badge } from "@repo/ui/badge";
import { X } from "lucide-react";
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
import { updateMedicationProtocol } from "@/app/actions/doctor/treatments/update-protocol";
import { createMedicationProtocol } from "@/app/actions/doctor/treatments/create-protocol";
import { normalizeDateForInput } from "@/lib/upload-utils";

interface MedicationProtocol {
  id: number;
  protocolType: string;
  drugName: string;
  dose: string;
  administrationRoute: string;
  duration: string;
  startDate?: string;
  additionalMedication?: string[];
}

interface ProtocolFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatmentId: number;
  protocol?: MedicationProtocol | null;
  onSuccess: () => void;
}

// Schema for create mode (without id)
const CreateFormSchema = CreateMedicationProtocolSchema;

// Schema for update mode (with id)
const UpdateFormSchema = UpdateMedicationProtocolSchema;

type CreateFormValues = z.infer<typeof CreateFormSchema>;
type UpdateFormValues = z.infer<typeof UpdateFormSchema>;

export function ProtocolFormSheet({
  open,
  onOpenChange,
  treatmentId,
  protocol,
  onSuccess,
}: ProtocolFormSheetProps) {
  const queryClient = useQueryClient();
  const [additionalMeds, setAdditionalMeds] = useState<string[]>([]);
  const [newMed, setNewMed] = useState("");

  const isEditMode = !!protocol;

  const form = useForm<CreateFormValues | UpdateFormValues>({
    resolver: zodResolver(isEditMode ? UpdateFormSchema : CreateFormSchema),
    defaultValues: isEditMode
      ? {
          id: protocol?.id,
          treatmentId,
          protocolType: protocol?.protocolType || "",
          drugName: protocol?.drugName || "",
          dose: protocol?.dose || "",
          administrationRoute: protocol?.administrationRoute || "",
          duration: protocol?.duration || null,
          startDate: normalizeDateForInput(protocol?.startDate),
        }
      : {
          treatmentId,
          protocolType: "",
          drugName: "",
          dose: "",
          administrationRoute: "",
          duration: null,
          startDate: null,
        },
  });

  useEffect(() => {
    if (open) {
      if (protocol) {
        form.reset({
          id: protocol.id,
          treatmentId,
          protocolType: protocol.protocolType || "",
          drugName: protocol.drugName || "",
          dose: protocol.dose || "",
          administrationRoute: protocol.administrationRoute || "",
          duration: protocol.duration || null,
          startDate: normalizeDateForInput(protocol.startDate),
        });
        setAdditionalMeds(protocol.additionalMedication || []);
      } else {
        form.reset({
          treatmentId,
          protocolType: "",
          drugName: "",
          dose: "",
          administrationRoute: "",
          duration: null,
          startDate: null,
        });
        setAdditionalMeds([]);
      }
    }
  }, [open, protocol, treatmentId, form]);

  const handleAddMed = () => {
    if (newMed.trim()) {
      setAdditionalMeds([...additionalMeds, newMed.trim()]);
      setNewMed("");
    }
  };

  const handleRemoveMed = (index: number) => {
    setAdditionalMeds(additionalMeds.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreateFormValues | UpdateFormValues) => {
    try {
      const dataWithMeds = {
        ...data,
        additionalMedication: additionalMeds.length > 0 ? additionalMeds : null,
      };

      let result;
      if (isEditMode) {
        result = await updateMedicationProtocol(dataWithMeds);
      } else {
        result = await createMedicationProtocol(dataWithMeds);
      }

      if (!result.success) {
        throw new Error(result.error);
      }

      queryClient.invalidateQueries({ queryKey: ["treatmentDetail"] });
      toast.success(
        isEditMode
          ? "Protocolo actualizado correctamente"
          : "Protocolo creado correctamente"
      );
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isEditMode
            ? "Error al actualizar el protocolo"
            : "Error al crear el protocolo"
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditMode
              ? "Editar Protocolo de Medicacion"
              : "Establecer Protocolo de Medicacion"}
          </SheetTitle>
          <SheetDescription>
            {isEditMode
              ? "Actualiza la informacion del protocolo de medicacion"
              : "Completa la informacion para establecer el protocolo de medicacion"}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-6"
          >
            <FormField
              control={form.control}
              name="protocolType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Protocolo *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ej: Protocolo corto con antagonistas"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="drugName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medicamento Principal *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: FSH recombinante" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dosis</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: 150 UI/dia" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="administrationRoute"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Via de Administracion</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: Subcutanea" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duracion</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="Ej: 10-12 dias"
                    />
                  </FormControl>
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
                    <Input type="date" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Medicacion Adicional</Label>
              <div className="flex gap-2">
                <Input
                  value={newMed}
                  onChange={(e) => setNewMed(e.target.value)}
                  placeholder="Agregar medicamento adicional"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddMed();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddMed} variant="outline">
                  Agregar
                </Button>
              </div>
              {additionalMeds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {additionalMeds.map((med, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {med}
                      <button
                        type="button"
                        onClick={() => handleRemoveMed(idx)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="flex-1"
              >
                {form.formState.isSubmitting
                  ? "Guardando..."
                  : isEditMode
                    ? "Guardar"
                    : "Crear Protocolo"}
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
