"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getTreatmentDetail } from "@/app/actions/doctor/treatments/get-detail";
import { getMedicalOrdersByTreatment } from "@/app/actions/doctor/medical-orders/get-by-treatment";
import {
  Stethoscope,
  User,
  Calendar,
  FileText,
  AlertCircle,
  Plus,
  Activity,
  Pill,
  ClipboardCheck,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/alert";
import { DoctorNoteFormSheet } from "@/components/doctor/treatments/forms/doctor-note-form-sheet";
import { ProtocolFormSheet } from "@/components/doctor/treatments/forms/protocol-form-sheet";
import { TreatmentFormSheet } from "@/components/doctor/treatments/forms/treatment-form-sheet";
import { DeleteNoteDialog } from "@/components/doctor/treatments/forms/delete-note-dialog";
import { CreateMedicalOrderSheet } from "@/components/doctor/treatments/forms/create-medical-order-sheet";
import { InformedConsentFormSheet } from "@/components/doctor/treatments/forms/informed-consent-form-sheet";
import { useQueryClient } from "@tanstack/react-query";
import { getFileUrl } from "@/lib/upload-utils";

export default function TreatmentDetailPage() {
  const [noteSheetOpen, setNoteSheetOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [protocolSheetOpen, setProtocolSheetOpen] = useState(false);
  const [treatmentSheetOpen, setTreatmentSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);
  const [createOrderSheetOpen, setCreateOrderSheetOpen] = useState(false);
  const [consentSheetOpen, setConsentSheetOpen] = useState(false);
  const queryClient = useQueryClient();
  const params = useParams();
  const id = params?.id as string | undefined;

  const {
    data: treatmentData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["treatmentDetail", id],
    queryFn: async () => {
      if (!id) return null;
      return await getTreatmentDetail(Number(id));
    },
    enabled: !!id,
  });

  const { data: medicalOrdersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["medicalOrders", "treatment", id],
    queryFn: async () => {
      if (!id) return null;
      return await getMedicalOrdersByTreatment(Number(id));
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
              Error al cargar tratamiento
            </h3>
            <p className="text-sm text-red-700">{(error as Error).message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!treatmentData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Tratamiento no encontrado</p>
        </div>
      </div>
    );
  }

  const treatment = treatmentData.treatment;
  const patient = treatment.medicalHistory?.patient;
  const monitorings = treatmentData.monitorings || [];
  const protocol = treatmentData.protocol;
  const doctorNotes = treatmentData.doctorNotes || [];
  const informedConsent = treatmentData.informedConsent;
  const milestones = treatmentData.milestones || [];
  const medicalCoverage = treatmentData.medicalCoverage;

  const handleAddNote = () => {
    setSelectedNote(null);
    setNoteSheetOpen(true);
  };

  const handleEditNote = (note: any) => {
    setSelectedNote(note);
    setNoteSheetOpen(true);
  };

  const handleDeleteNote = (noteId: number) => {
    setNoteToDelete(noteId);
    setDeleteDialogOpen(true);
  };

  const handleEditProtocol = () => {
    if (protocol) {
      setProtocolSheetOpen(true);
    }
  };

  const handleEditTreatment = () => {
    setTreatmentSheetOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Stethoscope className="h-8 w-8 text-primary" />
        </div>
        <div className="flex justify-between items-center w-full">
          <div>
            <h1 className="text-3xl font-bold">DETALLE DEL TRATAMIENTO</h1>
            <p className="text-muted-foreground">
              Información completa y órdenes médicas
            </p>
          </div>
          <div className="flex gap-3 items-center">
            {/* Indicador de estado del consentimiento */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Consentimiento Informado:
              </span>
              {!informedConsent ? (
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-700 border-yellow-300"
                >
                  Sin crear
                </Badge>
              ) : informedConsent.pdfUri ? (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700 border-green-300"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Con PDF
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700 border-blue-300"
                >
                  Sin PDF
                </Badge>
              )}
            </div>

            {/* Botones de acción */}
            {!informedConsent ? (
              <Button
                variant="default"
                size="sm"
                onClick={() => setConsentSheetOpen(true)}
              >
                Crear Consentimiento
              </Button>
            ) : (
              <>
                {informedConsent.pdfUri && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = getFileUrl(informedConsent.pdfUri);
                      if (url) window.open(url, "_blank");
                    }}
                  >
                    Ver PDF
                  </Button>
                )}
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setConsentSheetOpen(true)}
                >
                  Editar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Alerta de Consentimiento Informado Faltante o Sin PDF */}
      {(!informedConsent || !informedConsent.pdfUri) && (
        <Alert variant="destructive" className="border-2">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">
            Consentimiento Informado Requerido
          </AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-2">
              {!informedConsent ? (
                <>
                  Este tratamiento no tiene un consentimiento informado
                  registrado. Es obligatorio crear y cargar el documento PDF del
                  consentimiento antes de poder generar órdenes médicas.
                </>
              ) : (
                <>
                  El consentimiento informado de este tratamiento no tiene un
                  documento PDF asociado. Es obligatorio cargar el archivo PDF
                  del consentimiento firmado antes de poder generar órdenes
                  médicas.
                </>
              )}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConsentSheetOpen(true)}
              className="mt-2 bg-white hover:bg-gray-50"
            >
              {!informedConsent
                ? "Crear Consentimiento Ahora"
                : "Cargar PDF del Consentimiento"}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Patient Info Card */}
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
                Ver Historia Clínica
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Treatment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="border rounded-lg p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Información del Tratamiento
              </h2>
              <Badge
                variant="outline"
                className={
                  treatment.status === "vigente"
                    ? "bg-green-100 text-green-800 border-green-300"
                    : treatment.status === "completed"
                      ? "bg-blue-100 text-blue-800 border-blue-300"
                      : "bg-gray-100 text-gray-800 border-gray-300"
                }
              >
                {treatment.status === "vigente"
                  ? "Vigente"
                  : treatment.status === "completed"
                    ? "Completado"
                    : "Cerrado"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Objetivo del Tratamiento
                </label>
                <p className="mt-1 text-foreground">
                  {treatment.initialObjective?.replace(/_/g, " ") || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Médico Responsable
                </label>
                <p className="mt-1 text-foreground">
                  {treatment.initialDoctor
                    ? `Dr. ${treatment.initialDoctor.firstName} ${treatment.initialDoctor.lastName}`
                    : "N/A"}
                </p>
              </div>
              {treatment.startDate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Fecha de Inicio
                  </label>
                  <p className="mt-1 text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(treatment.startDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {treatment.closureDate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Fecha de Cierre
                  </label>
                  <p className="mt-1 text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(treatment.closureDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {treatment.closureReason && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Razón de Cierre
                  </label>
                  <p className="mt-1 text-foreground">
                    {treatment.closureReason}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Protocol Section */}
          {protocol && (
            <div className="border rounded-lg p-6 bg-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">
                    Protocolo de Medicación
                  </h2>
                </div>
                <Button variant="ghost" size="sm" onClick={handleEditProtocol}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="font-medium">Tipo:</span>{" "}
                  {protocol.protocolType}
                </p>
                <p>
                  <span className="font-medium">Medicamento:</span>{" "}
                  {protocol.drugName}
                </p>
                <p>
                  <span className="font-medium">Dosis:</span> {protocol.dose}
                </p>
                <p>
                  <span className="font-medium">Vía:</span>{" "}
                  {protocol.administrationRoute}
                </p>
                <p>
                  <span className="font-medium">Duración:</span>{" "}
                  {protocol.duration}
                </p>
                {protocol.startDate && (
                  <p>
                    <span className="font-medium">Inicio:</span>{" "}
                    {new Date(protocol.startDate).toLocaleDateString()}
                  </p>
                )}
                {protocol.additionalMedication &&
                  protocol.additionalMedication.length > 0 && (
                    <div>
                      <span className="font-medium">Medicación adicional:</span>
                      <ul className="list-disc list-inside ml-4 mt-1">
                        {protocol.additionalMedication.map(
                          (med: string, idx: number) => (
                            <li key={idx}>{med}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Monitorings Section */}
          {monitorings.length > 0 && (
            <div className="border rounded-lg p-6 bg-card">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Monitoreos</h2>
              </div>
              <div className="space-y-4">
                {monitorings.map((monitoring: any) => (
                  <div
                    key={monitoring.id}
                    className="border-l-4 border-primary pl-4 py-2"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium">
                        Día {monitoring.dayNumber} -{" "}
                        {new Date(
                          monitoring.monitoringDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm space-y-1 text-muted-foreground">
                      <p>Folículos: {monitoring.follicleCount}</p>
                      <p>Tamaño: {monitoring.follicleSize}</p>
                      <p>Estradiol: {monitoring.estradiolLevel} pg/ml</p>
                      {monitoring.observations && (
                        <p className="italic mt-2">{monitoring.observations}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Doctor Notes Section */}
          <div className="border rounded-lg p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Notas del Doctor</h2>
              </div>
              <Button size="sm" onClick={handleAddNote}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Nota
              </Button>
            </div>
            {doctorNotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay notas registradas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {doctorNotes.map((note: any) => (
                  <div
                    key={note.id}
                    className="border-l-4 border-blue-500 pl-4 py-2"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium">
                          {new Date(note.noteDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Dr. {note.doctor?.firstName} {note.doctor?.lastName}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditNote(note)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm">{note.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Medical Orders Section */}
          <div className="border rounded-lg p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Órdenes Médicas
              </h2>
              <div className="relative group">
                <Button
                  onClick={() => setCreateOrderSheetOpen(true)}
                  disabled={!informedConsent || !informedConsent.pdfUri}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Orden Médica
                </Button>
                {(!informedConsent || !informedConsent.pdfUri) && (
                  <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                    {!informedConsent
                      ? "Se requiere un consentimiento informado con PDF firmado para crear órdenes médicas"
                      : "El consentimiento debe tener un PDF asociado para crear órdenes médicas"}
                  </div>
                )}
              </div>
            </div>

            {ordersLoading ? (
              <div className="text-center py-8">
                <div className="loading-spinner mx-auto"></div>
              </div>
            ) : !medicalOrdersData || medicalOrdersData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay órdenes médicas registradas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {medicalOrdersData.map((order: any) => (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium">#{order.code}</p>
                          <Badge
                            variant="outline"
                            className={
                              order.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {order.status === "completed"
                              ? "Completada"
                              : "Pendiente"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {order.category}
                        </p>
                        <p className="text-sm">
                          {new Date(order.issueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Link href={`/doctor/medical-orders/${order.id}`}>
                        <Button variant="outline" size="sm">
                          Ver Detalle
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Quick Actions */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-4 bg-card space-y-3 sticky top-6">
            <h3 className="font-semibold mb-3">ACCIONES RÁPIDAS</h3>
            <div className="relative group">
              <Button
                variant="default"
                className="w-full justify-start"
                onClick={() => setCreateOrderSheetOpen(true)}
                disabled={!informedConsent || !informedConsent.pdfUri}
              >
                <Plus className="h-4 w-4 mr-2" />
                NUEVA ORDEN MÉDICA
              </Button>
              {(!informedConsent || !informedConsent.pdfUri) && (
                <div className="absolute left-0 ml-2 top-full hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                  {!informedConsent
                    ? "Se requiere un consentimiento informado con PDF firmado"
                    : "El consentimiento debe tener un PDF asociado"}
                </div>
              )}
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleEditTreatment}
            >
              <FileText className="h-4 w-4 mr-2" />
              EDITAR TRATAMIENTO
            </Button>
            {patient && (
              <Link href={`/doctor/patients/${patient.id}`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  VER PACIENTE
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Forms and Dialogs */}
      <DoctorNoteFormSheet
        open={noteSheetOpen}
        onOpenChange={setNoteSheetOpen}
        treatmentId={treatment.id}
        note={selectedNote}
        onSuccess={() => setNoteSheetOpen(false)}
      />

      {protocol && (
        <ProtocolFormSheet
          open={protocolSheetOpen}
          onOpenChange={setProtocolSheetOpen}
          treatmentId={treatment.id}
          protocol={protocol}
          onSuccess={() => setProtocolSheetOpen(false)}
        />
      )}

      <TreatmentFormSheet
        open={treatmentSheetOpen}
        onOpenChange={setTreatmentSheetOpen}
        treatment={treatment}
        onSuccess={() => setTreatmentSheetOpen(false)}
      />

      {noteToDelete && (
        <DeleteNoteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          noteId={noteToDelete}
          onSuccess={() => {
            setDeleteDialogOpen(false);
            setNoteToDelete(null);
          }}
        />
      )}

      <CreateMedicalOrderSheet
        open={createOrderSheetOpen}
        onOpenChange={setCreateOrderSheetOpen}
        treatmentId={treatment.id}
        patientId={patient?.id || 0}
        doctorId={treatment.initialDoctor?.id || 0}
        onSuccess={() => setCreateOrderSheetOpen(false)}
      />

      <InformedConsentFormSheet
        open={consentSheetOpen}
        onOpenChange={setConsentSheetOpen}
        treatmentId={treatment.id}
        informedConsent={informedConsent || null}
        onSuccess={() => {
          setConsentSheetOpen(false);
          queryClient.invalidateQueries({ queryKey: ["treatmentDetail", id] });
        }}
      />
    </div>
  );
}
