"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CreateInformedConsentSchema,
  UpdateInformedConsentSchema,
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
import { createInformedConsent } from "@/app/actions/doctor/treatments/create-informed-consent";
import { updateInformedConsent } from "@/app/actions/doctor/treatments/update-informed-consent";

interface InformedConsent {
  id: number;
  pdfUri?: string | null;
  signatureDate?: string | null;
  uploadedByUserId?: number | null;
}

interface InformedConsentFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatmentId: number;
  informedConsent?: InformedConsent | null;
  onSuccess: () => void;
}

export function InformedConsentFormSheet({
  open,
  onOpenChange,
  treatmentId,
  informedConsent,
  onSuccess,
}: InformedConsentFormSheetProps) {
  const queryClient = useQueryClient();
  const isEditing = !!informedConsent;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentPdfUri, setCurrentPdfUri] = useState<string | null>(null);

  const formSchema = isEditing
    ? UpdateInformedConsentSchema
    : CreateInformedConsentSchema;
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditing && informedConsent
      ? {
          id: informedConsent.id,
          treatmentId,
          pdfUri: informedConsent.pdfUri || null,
          signatureDate: normalizeDateForInput(informedConsent.signatureDate),
          uploadedByUserId: informedConsent.uploadedByUserId || null,
        }
      : {
          treatmentId,
          pdfUri: null,
          signatureDate: new Date().toISOString().split("T")[0],
          uploadedByUserId: null,
        },
  });

  useEffect(() => {
    if (open) {
      if (isEditing && informedConsent) {
        form.reset({
          id: informedConsent.id,
          treatmentId,
          pdfUri: informedConsent.pdfUri || null,
          signatureDate: normalizeDateForInput(informedConsent.signatureDate),
          uploadedByUserId: informedConsent.uploadedByUserId || null,
        });
        setCurrentPdfUri(informedConsent.pdfUri || null);
      } else {
        form.reset({
          treatmentId,
          pdfUri: null,
          signatureDate: new Date().toISOString().split("T")[0],
          uploadedByUserId: null,
        });
        setCurrentPdfUri(null);
      }
      setSelectedFile(null);
      setUploadProgress(0);
    }
  }, [open, informedConsent, treatmentId, isEditing, form]);

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
      let pdfUri: string | null = currentPdfUri;

      if (selectedFile) {
        setUploadProgress(10);
        pdfUri = await uploadPDF(selectedFile, 'informed-consent');
        setUploadProgress(100);
      }

      const finalData = {
        ...data,
        pdfUri,
      };

      const result = isEditing
        ? await updateInformedConsent(finalData)
        : await createInformedConsent(finalData);

      if (!result.success) {
        throw new Error(result.error);
      }

      queryClient.invalidateQueries({ queryKey: ["treatmentDetail"] });
      toast.success(
        isEditing
          ? "Consentimiento actualizado correctamente"
          : "Consentimiento creado correctamente"
      );
      setUploadProgress(0);
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al guardar el consentimiento"
      );
      setUploadProgress(0);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setCurrentPdfUri(null);
    form.setValue("pdfUri", null);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Editar Consentimiento" : "Agregar Consentimiento Informado"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Actualiza el consentimiento informado"
              : "Agrega un nuevo consentimiento informado al tratamiento"}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-6"
          >
            <FormField
              control={form.control}
              name="signatureDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Firma</FormLabel>
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
              <Label>Documento PDF del Consentimiento</Label>

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
                    onClick={handleRemoveFile}
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
