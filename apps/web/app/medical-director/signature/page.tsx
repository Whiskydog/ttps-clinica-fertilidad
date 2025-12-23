"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Alert, AlertDescription } from "@repo/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/alert-dialog";
import { PenTool, Upload, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "@repo/ui";
import { getSignature } from "@/app/actions/doctor/signature/get-signature";
import { uploadSignature } from "@/app/actions/doctor/signature/upload-signature";
import { deleteSignature } from "@/app/actions/doctor/signature/delete-signature";
import { getFileUrl } from "@/lib/upload-utils";

export default function DoctorSignaturePage() {
  const [signatureUri, setSignatureUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imageKey, setImageKey] = useState(Date.now()); // Cache buster
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSignature();
  }, []);

  const loadSignature = async () => {
    setIsLoading(true);
    const result = await getSignature();
    console.log(result);
    if (result.success && result.data) {
      // El backend devuelve { data: { data: { signatureUri } } }
      // Necesitamos acceder a result.data.data.signatureUri
      const signatureData = (result.data as any).data || result.data;
      const uri = signatureData.signatureUri;
      setSignatureUri(uri);
    }
    setIsLoading(false);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.includes("image/png") && !file.type.includes("image/jpeg")) {
      toast.error("Solo se permiten archivos PNG o JPG");
      return;
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("El archivo no debe superar los 2MB");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("signature", file);

      const result = await uploadSignature(formData);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success(signatureUri ? "Firma actualizada correctamente" : "Firma cargada correctamente");

      // Recargar la firma automáticamente y forzar actualización de imagen
      setImageKey(Date.now());
      await loadSignature();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al cargar la firma");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteDialog(false);
    setIsDeleting(true);

    try {
      const result = await deleteSignature();

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Firma eliminada correctamente");

      // Recargar la firma automáticamente y forzar actualización de imagen
      setImageKey(Date.now());
      await loadSignature();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar la firma");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-xl">
          <PenTool className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">MI FIRMA</h1>
          <p className="text-muted-foreground">
            Gestione su firma digital para órdenes médicas
          </p>
        </div>
      </div>

      {/* Info Alert */}
      {!signatureUri && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Configure su firma digital para que se use automáticamente en todas las
            órdenes médicas que genere. Solo necesita cargarla una vez.
          </AlertDescription>
        </Alert>
      )}

      {signatureUri && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900">
            Su firma está configurada y se usará automáticamente en las órdenes médicas.
          </AlertDescription>
        </Alert>
      )}

      {/* Signature Display/Upload Card */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Firma Actual</h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Cargando firma...</span>
          </div>
        ) : signatureUri ? (
          <div className="space-y-4">
            {/* Preview con mejor visualización */}
            <div className="border-2 border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-white">
              <p className="text-sm text-muted-foreground mb-3">Vista previa de su firma:</p>
              <div className="bg-gray-50 p-6 rounded border border-gray-200 max-w-md w-full flex items-center justify-center min-h-[150px]">
                <img
                  src={`${getFileUrl(signatureUri)}?v=${imageKey}`}
                  alt="Firma del doctor"
                  className="max-h-40 max-w-full object-contain"
                  onError={(e) => {
                    console.error("Error loading signature image");
                    e.currentTarget.src = "";
                  }}
                />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Firma configurada correctamente</span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isDeleting}
                className="min-w-[150px]"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "Subiendo..." : "Cambiar Firma"}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting || isUploading}
                className="min-w-[150px]"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Firma
              </Button>
            </div>

            {/* Información sobre cambiar firma */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Al cambiar su firma, la nueva firma se usará automáticamente en todas las órdenes médicas futuras que genere.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center text-center bg-gray-50">
              <div className="p-4 bg-white rounded-full mb-4 shadow-sm">
                <PenTool className="h-12 w-12 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No tiene una firma configurada</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Para generar órdenes médicas necesita configurar su firma digital.
                Suba una imagen de su firma para comenzar.
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                size="lg"
              >
                <Upload className="h-5 w-5 mr-2" />
                {isUploading ? "Subiendo..." : "Subir Firma"}
              </Button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleFileSelect}
          className="hidden"
        />
      </Card>

      {/* Instructions */}
      <Card className="p-6">
        <h3 className="font-semibold mb-3">Instrucciones</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>La firma debe ser una imagen en formato PNG o JPG</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>El tamaño máximo del archivo es de 2MB</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              Se recomienda usar una imagen con fondo transparente o blanco para
              mejor visualización
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              Una vez configurada, su firma se usará automáticamente en todas las
              órdenes médicas que genere
            </span>
          </li>
        </ul>
      </Card>

      {/* AlertDialog para confirmación de eliminación */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente su firma guardada.
              Deberá subir una nueva firma para poder generar órdenes médicas en el futuro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
