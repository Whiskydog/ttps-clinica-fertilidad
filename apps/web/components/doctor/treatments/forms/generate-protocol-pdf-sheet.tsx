"use client";

import { useState, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/sheet";
import { Button } from "@repo/ui/button";
import { Label } from "@repo/ui/label";
import { toast } from "@repo/ui";
import { useQueryClient } from "@tanstack/react-query";
import { Upload, FileText, CheckCircle, Loader2, Download } from "lucide-react";
import { generateProtocolPdf } from "@/app/actions/doctor/treatments/generate-protocol-pdf";
import { getFileUrl } from "@/lib/upload-utils";

interface GenerateProtocolPdfSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatmentId: number;
  existingPdfUrl?: string | null;
  onSuccess: () => void;
}

export function GenerateProtocolPdfSheet({
  open,
  onOpenChange,
  treatmentId,
  existingPdfUrl,
  onSuccess,
}: GenerateProtocolPdfSheetProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen (PNG, JPG)");
      return;
    }

    // Validar tamaño (500KB max)
    const maxSize = 500 * 1024;
    if (file.size > maxSize) {
      toast.error("La imagen no debe superar los 500KB");
      return;
    }

    setSignatureFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setSignaturePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!signatureFile) {
      toast.error("Debe subir su firma para generar el PDF");
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append("doctorSignature", signatureFile);

      const result = await generateProtocolPdf(treatmentId, formData);

      if (!result.success) {
        throw new Error(result.error);
      }

      setGeneratedPdfUrl(result.data?.pdfUrl || null);
      queryClient.invalidateQueries({ queryKey: ["treatmentDetail"] });
      toast.success("PDF de orden de medicación generado correctamente");
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al generar el PDF"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    const url = generatedPdfUrl || existingPdfUrl;
    if (url) {
      window.open(getFileUrl(url) || undefined, "_blank");
    }
  };

  const resetState = () => {
    setSignatureFile(null);
    setSignaturePreview(null);
    setGeneratedPdfUrl(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetState();
    }
    onOpenChange(newOpen);
  };

  const currentPdfUrl = generatedPdfUrl || existingPdfUrl;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Generar PDF de Orden de Medicación</SheetTitle>
          <SheetDescription>
            Suba su firma para generar el PDF de la orden de medicación.
            El paciente recibirá una notificación por email y podrá descargarlo.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Estado de PDF existente */}
          {currentPdfUrl && !generatedPdfUrl && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <FileText className="h-5 w-5" />
                <span className="font-medium">PDF existente</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Ya existe un PDF generado para este protocolo.
                Puede descargarlo o generar uno nuevo.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF actual
              </Button>
            </div>
          )}

          {/* Estado de PDF generado exitosamente */}
          {generatedPdfUrl && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">PDF generado exitosamente</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                El PDF ha sido generado y el paciente ha sido notificado por email.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </Button>
            </div>
          )}

          {/* Input de firma */}
          <div className="space-y-3">
            <Label>Firma del Médico 🞲</Label>
            <p className="text-sm text-muted-foreground">
              Suba una imagen de su firma (PNG o JPG, máximo 500KB)
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />

            {signaturePreview ? (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Vista previa:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSignatureFile(null);
                      setSignaturePreview(null);
                    }}
                  >
                    Cambiar
                  </Button>
                </div>
                <div className="flex justify-center">
                  <img
                    src={signaturePreview}
                    alt="Firma del médico"
                    className="max-h-24 object-contain"
                  />
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full h-24 border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Haga clic para subir su firma
                  </span>
                </div>
              </Button>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleGenerate}
              disabled={!signatureFile || isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  {currentPdfUrl ? "Regenerar PDF" : "Generar PDF"}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isGenerating}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
