"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMedicalOrderDetail } from "@/app/actions/doctor/medical-orders/get-detail";
import {
  FileText,
  User,
  Calendar,
  AlertCircle,
  Edit,
  Plus,
  Download,
  Stethoscope,
  CheckCircle2,
  Clock,
  FilePlus2,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { MedicalOrderFormSheet } from "@/components/doctor/medical-orders/forms/medical-order-form-sheet";
import { StudyResultFormSheet } from "@/components/doctor/medical-orders/forms/study-result-form-sheet";
import { GeneratePdfSheet } from "@/components/doctor/medical-orders/forms/generate-pdf-sheet";
import { getFileUrl, formatDateForDisplay } from "@/lib/upload-utils";

export default function MedicalOrderDetailPage() {
  const [orderSheetOpen, setOrderSheetOpen] = useState(false);
  const [resultSheetOpen, setResultSheetOpen] = useState(false);
  const [pdfSheetOpen, setPdfSheetOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);

  const params = useParams();
  const id = params?.id as string | undefined;
  const queryClient = useQueryClient();

  const {
    data: orderData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["medicalOrderDetail", id],
    queryFn: async () => {
      if (!id) return null;
      const payload = await getMedicalOrderDetail(Number(id));
      return payload || null;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 p-4 border border-red-200 bg-red-50 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">
              Error al cargar orden médica
            </h3>
            <p className="text-sm text-red-700">{(error as Error).message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Orden médica no encontrada</p>
        </div>
      </div>
    );
  }

  const patient = orderData.patient;
  const doctor = orderData.doctor;
  const treatment = orderData.treatment;
  const studyResults = orderData.studyResults || [];

  const handleAddResult = () => {
    setSelectedResult(null);
    setResultSheetOpen(true);
  };

  const handleEditResult = (result: any) => {
    setSelectedResult(result);
    setResultSheetOpen(true);
  };

  const handleDownloadPdf = (pdfUri: string, studyName: string) => {
    const fileUrl = getFileUrl(pdfUri);
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-xl">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">ORDEN MÉDICA #{orderData.code}</h1>
          <p className="text-muted-foreground">
            Detalle completo de la orden médica
          </p>
        </div>
        <div className="flex gap-2">
          {orderData.pdfUrl && (
            <Button
              variant="outline"
              onClick={() => {
                const url = getFileUrl(orderData.pdfUrl);
                if (url) window.open(url, "_blank");
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Ver PDF
            </Button>
          )}
          {orderData.status !== "completed" && (
            <Button variant="outline" onClick={() => setPdfSheetOpen(true)}>
              <FilePlus2 className="h-4 w-4 mr-2" />
              {orderData.pdfUrl ? "Regenerar PDF" : "Generar PDF"}
            </Button>
          )}
          <Button onClick={() => setOrderSheetOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar Orden
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-6">
          {/* Patient Info */}
          {patient && (
            <div className="border rounded-lg p-4 bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      DNI: {patient.dni}
                    </p>
                  </div>
                </div>
                <Link href={`/doctor/patients/${patient.id}`}>
                  <Button variant="outline" size="sm">
                    Ver Paciente
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Order Details */}
          <div className="border rounded-lg p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Información de la Orden</h2>
              <Badge
                variant="outline"
                className={
                  orderData.status === "completed"
                    ? "bg-green-100 text-green-800 border-green-300"
                    : "bg-yellow-100 text-yellow-800 border-yellow-300"
                }
              >
                {orderData.status === "completed" ? (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                ) : (
                  <Clock className="h-3 w-3 mr-1" />
                )}
                {orderData.status === "completed" ? "Completada" : "Pendiente"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Categoría
                </label>
                <p className="mt-1 text-foreground">{orderData.category}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Fecha de Emisión
                </label>
                <p className="mt-1 text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(orderData.issueDate).toLocaleDateString()}
                </p>
              </div>

              {orderData.completedDate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Fecha de Completado
                  </label>
                  <p className="mt-1 text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDateForDisplay(orderData.completedDate)}
                  </p>
                </div>
              )}

              {doctor && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Médico Solicitante
                  </label>
                  <p className="mt-1 text-foreground">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </p>
                </div>
              )}

              {treatment && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Tratamiento Asociado
                  </label>
                  <p className="mt-1">
                    <Link
                      href={`/doctor/treatments/${treatment.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Ver tratamiento #{treatment.id}
                    </Link>
                  </p>
                </div>
              )}

              {orderData.description && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Descripción
                  </label>
                  <p className="mt-1 text-foreground">
                    {orderData.description}
                  </p>
                </div>
              )}

              {orderData.diagnosis && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Diagnóstico
                  </label>
                  <p className="mt-1 text-foreground">{orderData.diagnosis}</p>
                </div>
              )}

              {orderData.justification && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Justificación
                  </label>
                  <p className="mt-1 text-foreground">
                    {orderData.justification}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Studies List */}
          {orderData.studies && orderData.studies.length > 0 && (
            <div className="border rounded-lg p-6 bg-card">
              <h2 className="text-xl font-semibold mb-4">
                Estudios Solicitados
              </h2>
              <div className="space-y-2">
                {orderData.studies.map((study: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-3 border rounded-lg"
                  >
                    {study.checked ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    )}
                    <span
                      className={
                        study.checked
                          ? "line-through text-muted-foreground"
                          : ""
                      }
                    >
                      {study.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Study Results */}
          <div className="border rounded-lg p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Resultados de Estudios
              </h2>
              <Button onClick={handleAddResult}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Resultado
              </Button>
            </div>

            {studyResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay resultados cargados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {studyResults.map((result: any) => (
                  <div
                    key={result.id}
                    className="border rounded-lg p-4 bg-muted/30"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">
                            {result.studyName || "Estudio sin nombre"}
                          </h3>
                          {result.originalPdfUri && (
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-blue-700 border-blue-300"
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              PDF Adjunto
                            </Badge>
                          )}
                        </div>
                        {result.determinationName && (
                          <p className="text-sm text-muted-foreground">
                            {result.determinationName}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditResult(result)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {result.originalPdfUri && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDownloadPdf(
                                result.originalPdfUri,
                                result.studyName || "resultado"
                              )
                            }
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {result.transcription && (
                      <div className="mb-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Transcripción:
                        </label>
                        <p className="text-sm mt-1 whitespace-pre-wrap">
                          {result.transcription}
                        </p>
                      </div>
                    )}

                    {result.transcriptionDate && (
                      <p className="text-xs text-muted-foreground">
                        Fecha:{" "}
                        {new Date(
                          result.transcriptionDate
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Forms */}
      <MedicalOrderFormSheet
        open={orderSheetOpen}
        onOpenChange={setOrderSheetOpen}
        medicalOrder={orderData}
        onSuccess={() => setOrderSheetOpen(false)}
      />

      <StudyResultFormSheet
        open={resultSheetOpen}
        onOpenChange={setResultSheetOpen}
        medicalOrderId={orderData.id}
        studyResult={selectedResult}
        onSuccess={() => {
          setResultSheetOpen(false);
          setSelectedResult(null);
        }}
      />

      <GeneratePdfSheet
        open={pdfSheetOpen}
        onOpenChange={setPdfSheetOpen}
        orderId={orderData.id}
        orderCode={orderData.code}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ["medicalOrderDetail", id],
          });
        }}
      />
    </div>
  );
}
