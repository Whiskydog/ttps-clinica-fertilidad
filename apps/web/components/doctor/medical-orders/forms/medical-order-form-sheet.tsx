"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UpdateMedicalOrderSchema, Study } from "@repo/contracts";
import { getStudyLists, StudyLists } from "@/app/actions/doctor/external/get-study-lists";
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
import { X } from "lucide-react";
import { toast } from "@repo/ui";
import { useQueryClient } from "@tanstack/react-query";
import { updateMedicalOrder } from "@/app/actions/doctor/medical-orders/update-medical-order";
import { normalizeDateForInput } from "@/lib/upload-utils";

interface MedicalOrder {
  id: number;
  code: string;
  issueDate: string;
  status: "pending" | "completed";
  category: string;
  description?: string | null;
  studies?: Study[] | null;
  diagnosis?: string | null;
  justification?: string | null;
  completedDate?: string | null;
}

interface MedicalOrderFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicalOrder: MedicalOrder;
  onSuccess: () => void;
}

type FormValues = z.infer<typeof UpdateMedicalOrderSchema>;

export function MedicalOrderFormSheet({
  open,
  onOpenChange,
  medicalOrder,
  onSuccess,
}: MedicalOrderFormSheetProps) {
  const queryClient = useQueryClient();
  const [studies, setStudies] = useState<Study[]>([]);
  const [studyLists, setStudyLists] = useState<StudyLists>({
    semen: [],
    hormonales: [],
    ginecologicos: [],
    prequirurgicos: [],
  });

  // Fetch study lists from external module
  useEffect(() => {
    const fetchStudyLists = async () => {
      try {
        const { data } = await getStudyLists();
        setStudyLists(data);
      } catch (error) {
        console.error("Error fetching study lists:", error);
      }
    };
    fetchStudyLists();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(UpdateMedicalOrderSchema),
    defaultValues: {
      id: medicalOrder?.id,
      category: medicalOrder?.category || "",
      description: medicalOrder?.description || null,
      diagnosis: medicalOrder?.diagnosis || null,
      justification: medicalOrder?.justification || null,
      status: medicalOrder?.status || "pending",
      completedDate: normalizeDateForInput(medicalOrder?.completedDate),
    },
  });

  useEffect(() => {
    if (open && medicalOrder) {
      form.reset({
        id: medicalOrder.id,
        category: medicalOrder.category || "",
        description: medicalOrder.description || null,
        diagnosis: medicalOrder.diagnosis || null,
        justification: medicalOrder.justification || null,
        status: medicalOrder.status || "pending",
        completedDate: normalizeDateForInput(medicalOrder.completedDate),
      });
      setStudies(medicalOrder.studies || []);
    }
  }, [open, medicalOrder, form]);

  const status = form.watch("status");

  // Watch category to filter available studies
  const selectedCategory = useWatch({
    control: form.control,
    name: "category",
  });

  // Get available studies based on selected category
  const getAvailableStudies = (): string[] => {
    const categoryToStudies: Record<string, string[]> = {
      'Estudios Hormonales': studyLists.hormonales,
      'Estudios Ginecológicos': studyLists.ginecologicos,
      'Estudios de Semen': studyLists.semen,
      'Estudios Prequirúrgicos': studyLists.prequirurgicos,
    };

    const availableStudies = categoryToStudies[selectedCategory] || [];
    const selectedStudyNames = studies.map(s => s.name);

    // Filter out already selected studies
    return availableStudies.filter(study => !selectedStudyNames.includes(study));
  };

  const handleAddStudy = (studyName: string) => {
    if (studyName) {
      setStudies([...studies, { name: studyName, checked: false }]);
    }
  };

  const handleRemoveStudy = (index: number) => {
    setStudies(studies.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const dataWithStudies = {
        ...data,
        studies: studies.length > 0 ? studies : null,
      };

      const result = await updateMedicalOrder(dataWithStudies);

      if (!result.success) {
        throw new Error(result.error);
      }

      queryClient.invalidateQueries({ queryKey: ["medicalOrderDetail"] });
      toast.success("Orden médica actualizada correctamente");
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al actualizar la orden médica"
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar Orden Médica</SheetTitle>
          <SheetDescription>
            Actualiza la información de la orden médica #{medicalOrder?.code}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-6"
          >
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Estudio *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione tipo de estudio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Estudios Hormonales">Estudios Hormonales</SelectItem>
                      <SelectItem value="Estudios Ginecológicos">Estudios Ginecológicos</SelectItem>
                      <SelectItem value="Estudios de Semen">Estudios de Semen</SelectItem>
                      <SelectItem value="Estudios Prequirúrgicos">Estudios Prequirúrgicos</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder="Descripción de la orden..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnóstico</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="Diagnóstico relacionado"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Justificación</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder="Justificación de la orden..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Estudios Solicitados</Label>
              {!selectedCategory ? (
                <p className="text-sm text-muted-foreground">
                  Seleccione primero un tipo de estudio
                </p>
              ) : getAvailableStudies().length === 0 && studies.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay estudios disponibles para esta categoría
                </p>
              ) : (
                <>
                  {getAvailableStudies().length > 0 && (
                    <Select onValueChange={handleAddStudy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Agregar estudio..." />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableStudies().map((study) => (
                          <SelectItem key={study} value={study}>
                            {study}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </>
              )}
              {studies.length > 0 && (
                <div className="space-y-2 mt-2 border rounded-lg p-3">
                  {studies.map((study, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2"
                    >
                      <span>{study.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStudy(idx)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
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
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="completed">Completada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {status === "completed" && (
              <FormField
                control={form.control}
                name="completedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Completado</FormLabel>
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
