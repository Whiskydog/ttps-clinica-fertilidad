"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/sheet";
import { Button } from "@repo/ui/button";
import { Alert, AlertDescription } from "@repo/ui/alert";
import { toast } from "@repo/ui";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, CheckCircle, Loader2, Download, Info, AlertTriangle } from "lucide-react";
import { generateProtocolPdf } from "@/app/actions/doctor/treatments/generate-protocol-pdf";
import { getFileUrl } from "@/lib/upload-utils";
import { getSignature } from "@/app/actions/doctor/signature/get-signature";
import Link from "next/link";

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [hasSignature, setHasSignature] = useState<boolean | null>(null);
  const [isCheckingSignature, setIsCheckingSignature] = useState(false);

  useEffect(() => {
    if (open) {
      checkSignature();
    }
  }, [open]);

  const checkSignature = async () => {
    setIsCheckingSignature(true);
    try {
      const result = await getSignature();

      // El backend puede devolver la estructura anidada
      const signatureData = (result.data as any)?.data || result.data;
      const hasSignatureUri = !!signatureData?.signatureUri;

      setHasSignature(result.success && hasSignatureUri);
    } catch (error) {
      console.error("Error checking signature:", error);
      setHasSignature(false);
    } finally {
      setIsCheckingSignature(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const formData = new FormData();

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
      window.open(getFileUrl(url), "_blank");
    }
  };

  const resetState = () => {
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
            Se utilizará su firma guardada para generar el PDF de la orden de medicación.
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

          {/* Verificación de firma */}
          {isCheckingSignature ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-sm text-gray-600">
                Verificando firma...
              </span>
            </div>
          ) : hasSignature === false ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No tiene una firma guardada configurada. Debe agregar su firma
                antes de poder generar el PDF.{" "}
                <Link
                  href="/doctor/signature"
                  className="underline font-medium"
                >
                  Ir a Mi Firma
                </Link>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Se utilizará su firma guardada para generar el PDF.
              </AlertDescription>
            </Alert>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || isCheckingSignature || !hasSignature}
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
