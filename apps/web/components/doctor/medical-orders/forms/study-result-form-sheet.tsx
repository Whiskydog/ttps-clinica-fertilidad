"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CreateStudyResultSchema,
  UpdateStudyResultSchema,
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
import { Textarea } from "@repo/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/form";
import { Upload, FileText, X } from "lucide-react";
import { toast } from "@repo/ui";
import { useQueryClient } from "@tanstack/react-query";
import { uploadPDF, getFileUrl, normalizeDateForInput } from "@/lib/upload-utils";
import { createStudyResult } from "@/app/actions/doctor/medical-orders/create-study-result";
import { updateStudyResult } from "@/app/actions/doctor/medical-orders/update-study-result";

interface StudyResult {
  id: number;
  studyName?: string | null;
  determinationName?: string | null;
  transcription?: string | null;
  originalPdfUri?: string | null;
  transcriptionDate?: string | null;
}

interface StudyResultFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicalOrderId: number;
  studyResult?: StudyResult | null;
  onSuccess: () => void;
}

export function StudyResultFormSheet({
  open,
  onOpenChange,
  medicalOrderId,
  studyResult,
  onSuccess,
}: StudyResultFormSheetProps) {
  const queryClient = useQueryClient();
  const isEditing = !!studyResult;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentPdfUri, setCurrentPdfUri] = useState<string | null>(null);

  const formSchema = isEditing
    ? UpdateStudyResultSchema
    : CreateStudyResultSchema;
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditing && studyResult
      ? {
          id: studyResult.id,
          medicalOrderId,
          studyName: studyResult.studyName || null,
          determinationName: studyResult.determinationName || null,
          transcription: studyResult.transcription || null,
          originalPdfUri: studyResult.originalPdfUri || null,
          transcriptionDate: normalizeDateForInput(studyResult.transcriptionDate),
        }
      : {
          medicalOrderId,
          studyName: null,
          determinationName: null,
          transcription: null,
          originalPdfUri: null,
          transcriptionDate: new Date().toISOString().split("T")[0],
        },
  });

  useEffect(() => {
    if (open) {
      if (isEditing && studyResult) {
        form.reset({
          id: studyResult.id,
          medicalOrderId,
          studyName: studyResult.studyName || null,
          determinationName: studyResult.determinationName || null,
          transcription: studyResult.transcription || null,
          originalPdfUri: studyResult.originalPdfUri || null,
          transcriptionDate: normalizeDateForInput(studyResult.transcriptionDate),
        });
        setCurrentPdfUri(studyResult.originalPdfUri || null);
      } else {
        form.reset({
          medicalOrderId,
          studyName: null,
          determinationName: null,
          transcription: null,
          originalPdfUri: null,
          transcriptionDate: new Date().toISOString().split("T")[0],
        });
        setCurrentPdfUri(null);
      }
      setSelectedFile(null);
      setUploadProgress(0);
    }
  }, [open, studyResult, medicalOrderId, isEditing, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== "application/pdf") {
        toast.error("Solo se permiten archivos PDF");
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("El archivo no debe superar los 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      let pdfUri: string | null = currentPdfUri; // Mantener el valor actual por defecto

      if (selectedFile) {
        // Si hay un nuevo archivo, subirlo
        setUploadProgress(10);
        pdfUri = await uploadPDF(selectedFile, 'study-result');
        setUploadProgress(100);
      }
      // Si no hay selectedFile, pdfUri mantiene el valor de currentPdfUri
      // (que puede ser null si se eliminó o si nunca hubo archivo)

      // Llamada real al server action
      const finalData = {
        ...data,
        originalPdfUri: pdfUri,
      };

      const result = isEditing
        ? await updateStudyResult(finalData)
        : await createStudyResult(finalData);

      if (!result.success) {
        throw new Error(result.error);
      }

      queryClient.invalidateQueries({ queryKey: ["medicalOrderDetail"] });
      toast.success(
        isEditing
          ? "Resultado actualizado correctamente"
          : "Resultado agregado correctamente"
      );
      setUploadProgress(0);
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al guardar el resultado"
      );
      setUploadProgress(0);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Editar Resultado" : "Agregar Resultado de Estudio"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Actualiza la información del resultado"
              : "Agrega un nuevo resultado a la orden médica"}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-6"
          >
            <FormField
              control={form.control}
              name="studyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Estudio</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="Ej: Análisis hormonal"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="determinationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Determinación</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="Ej: FSH, LH, Estradiol"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transcription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transcripción</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder="Transcripción de los resultados..."
                      rows={6}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transcriptionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Transcripción</FormLabel>
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

            <div className="space-y-2">
              <Label>Documento PDF del Resultado</Label>

              {/* Mostrar archivo actual si existe */}
              {currentPdfUri && !selectedFile && (
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Archivo actual</p>
                    <a
                      href={getFileUrl(currentPdfUri) || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Ver documento
                    </a>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCurrentPdfUri(null);
                      form.setValue("originalPdfUri", null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Mostrar archivo seleccionado */}
              {selectedFile && (
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Input de archivo */}
              {!selectedFile && (
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    id="pdf-upload"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {currentPdfUri ? "Reemplazar PDF" : "Subir PDF"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Máximo 10MB
                    </span>
                  </label>
                </div>
              )}

              {/* Progress bar */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>

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
