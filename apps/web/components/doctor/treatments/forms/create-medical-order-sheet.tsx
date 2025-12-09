"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreateMedicalOrderSchema, Study } from "@repo/contracts";
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
import { createMedicalOrder } from "@/app/actions/doctor/medical-orders/create-medical-order";

interface CreateMedicalOrderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatmentId: number;
  patientId: number;
  doctorId: number;
  onSuccess: () => void;
}

type FormValues = z.infer<typeof CreateMedicalOrderSchema>;

export function CreateMedicalOrderSheet({
  open,
  onOpenChange,
  treatmentId,
  patientId,
  doctorId,
  onSuccess,
}: CreateMedicalOrderSheetProps) {
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
    resolver: zodResolver(CreateMedicalOrderSchema),
    defaultValues: {
      patientId,
      doctorId,
      treatmentId,
      category: "",
      description: null,
      diagnosis: null,
      justification: null,
      studies: null,
    },
  });

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

      const result = await createMedicalOrder(dataWithStudies);

      if (!result.success) {
        throw new Error(result.error);
      }

      queryClient.invalidateQueries({
        queryKey: ["medicalOrders", "treatment", treatmentId.toString()],
      });
      toast.success("Orden médica creada correctamente");

      // Reset form and studies
      form.reset({
        patientId,
        doctorId,
        treatmentId,
        category: "",
        description: null,
        diagnosis: null,
        justification: null,
        studies: null,
      });
      setStudies([]);

      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al crear la orden médica"
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nueva Orden Médica</SheetTitle>
          <SheetDescription>
            Crea una nueva orden médica para el tratamiento actual
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
                        {getAvailableStudies().map((study, index) => (
                          <SelectItem key={`${study}-${index}`} value={study}>
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

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="flex-1"
              >
                {form.formState.isSubmitting ? "Creando..." : "Crear Orden"}
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
