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
import { FileText, Loader2, Info, AlertTriangle } from "lucide-react";
import { toast } from "@repo/ui";
import { getSignature } from "@/app/actions/doctor/signature/get-signature";
import Link from "next/link";

interface GeneratePdfSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
  orderCode: string;
  onSuccess: () => void;
}

export function GeneratePdfSheet({
  open,
  onOpenChange,
  orderId,
  orderCode,
  onSuccess,
}: GeneratePdfSheetProps) {
  const [isGenerating, setIsGenerating] = useState(false);
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

  const handleGeneratePdf = async () => {
    setIsGenerating(true);

    try {
      const formData = new FormData();

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const url = `${backendUrl}/medical-orders/${orderId}/generate-pdf`;

      console.log("Generando PDF para orden:", orderId);
      console.log("URL:", url);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        // Handle different error status codes
        if (response.status === 413) {
          throw new Error(
            "El archivo es demasiado grande. Por favor, use una imagen de firma más pequeña (máximo 500KB)."
          );
        }
        if (response.status === 401 || response.status === 403) {
          throw new Error("No tiene permisos para realizar esta acción.");
        }
        if (response.status === 404) {
          throw new Error("Orden médica no encontrada.");
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Error del servidor (${response.status})`
        );
      }

      toast.success(
        "PDF generado correctamente. Se enviará un email al paciente."
      );

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error generating PDF:", error);

      let errorMessage = "Error al generar el PDF";

      if (error instanceof Error) {
        // Check for specific error patterns
        if (
          error.message.includes("Body exceeded") ||
          error.message.includes("1 MB limit")
        ) {
          errorMessage =
            "El archivo es demasiado grande. Por favor, use una imagen de firma más pequeña (máximo 500KB).";
        } else if (
          error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError")
        ) {
          errorMessage =
            "Error de conexión. Verifique su conexión a internet e intente nuevamente.";
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generar PDF
          </SheetTitle>
          <SheetDescription>
            Genera el PDF de la orden médica #{orderCode}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
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
                Se utilizará su firma guardada para generar el PDF de la orden
                médica.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleGeneratePdf}
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
                  Generar PDF
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
