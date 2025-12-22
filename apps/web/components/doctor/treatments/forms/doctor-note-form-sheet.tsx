"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CreateDoctorNoteSchema,
  UpdateDoctorNoteSchema,
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/form";
import { toast } from "@repo/ui";
import { useQueryClient } from "@tanstack/react-query";
import { createDoctorNote } from "@/app/actions/doctor/treatments/create-doctor-note";
import { updateDoctorNote } from "@/app/actions/doctor/treatments/update-doctor-note";
import { normalizeDateForInput } from "@/lib/upload-utils";

interface DoctorNote {
  id: number;
  noteDate: string;
  note: string;
  doctor?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

interface DoctorNoteFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatmentId: number;
  note?: DoctorNote | null;
  onSuccess: () => void;
}

export function DoctorNoteFormSheet({
  open,
  onOpenChange,
  treatmentId,
  note,
  onSuccess,
}: DoctorNoteFormSheetProps) {
  const queryClient = useQueryClient();
  const isEditing = !!note;

  const formSchema = isEditing
    ? UpdateDoctorNoteSchema
    : CreateDoctorNoteSchema;
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditing
      ? {
        id: note.id,
        treatmentId,
        noteDate: normalizeDateForInput(note.noteDate) || new Date().toISOString().split("T")[0],
        note: note.note || "",
      }
      : {
        treatmentId,
        noteDate: new Date().toISOString().split("T")[0],
        note: "",
      },
  });

  useEffect(() => {
    if (open) {
      if (isEditing && note) {
        form.reset({
          id: note.id,
          treatmentId,
          noteDate: normalizeDateForInput(note.noteDate) || new Date().toISOString().split("T")[0],
          note: note.note || "",
        });
      } else {
        form.reset({
          treatmentId,
          noteDate: new Date().toISOString().split("T")[0],
          note: "",
        });
      }
    }
  }, [open, note, treatmentId, isEditing, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      const result = isEditing
        ? await updateDoctorNote(data)
        : await createDoctorNote(data);

      if (!result.success) {
        throw new Error(result.error);
      }

      queryClient.invalidateQueries({ queryKey: ["treatmentDetail"] });
      toast.success(
        isEditing
          ? "Nota actualizada correctamente"
          : "Nota agregada correctamente"
      );
      onSuccess();
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al guardar la nota"
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Editar Nota" : "Agregar Nota del Doctor"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Actualiza la información de la nota"
              : "Agrega una nueva nota al tratamiento"}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-6"
          >
            <FormField
              control={form.control}
              name="noteDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de la nota</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nota 🞲</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Escribe la nota del doctor..."
                      rows={8}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
