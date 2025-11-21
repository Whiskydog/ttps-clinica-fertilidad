"use client";

import { useState } from "react";
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
import { X, FileText, Loader2 } from "lucide-react";
import { toast } from "@repo/ui";

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
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.includes("png") && !file.type.includes("image")) {
        toast.error("La firma debe ser una imagen PNG");
        return;
      }
      // Validate file size (max 500KB for signatures)
      const maxSizeKB = 500;
      if (file.size > maxSizeKB * 1024) {
        toast.error(
          `La imagen de firma es muy grande (${(file.size / 1024).toFixed(0)}KB). El máximo permitido es ${maxSizeKB}KB. Por favor, reduzca el tamaño de la imagen.`
        );
        return;
      }
      setSignatureFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSignature = () => {
    setSignatureFile(null);
    setSignaturePreview(null);
  };

  const handleGeneratePdf = async () => {
    if (!signatureFile) {
      toast.error("Debe subir la firma del médico");
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append("doctorSignature", signatureFile);

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const url = `${backendUrl}/v1/api/medical-orders/${orderId}/generate-pdf`;

      console.log("Generando PDF para orden:", orderId);
      console.log("URL:", url);
      console.log("Archivo:", signatureFile.name, signatureFile.size, "bytes");

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

      // Reset state
      setSignatureFile(null);
      setSignaturePreview(null);

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
          <div className="space-y-2">
            <Label>Firma del Médico (PNG) *</Label>
            <div className="flex flex-col gap-2">
              <Input
                type="file"
                accept="image/png,image/*"
                onChange={handleSignatureChange}
                className="cursor-pointer"
              />
              {signaturePreview && (
                <div className="relative border rounded-lg p-2 bg-gray-50">
                  <img
                    src={signaturePreview}
                    alt="Vista previa de firma"
                    className="max-h-24 mx-auto"
                  />
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="absolute top-1 right-1 text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Suba una imagen PNG con su firma (máximo 500KB) para incluirla
                en el PDF de la orden médica
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleGeneratePdf}
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
