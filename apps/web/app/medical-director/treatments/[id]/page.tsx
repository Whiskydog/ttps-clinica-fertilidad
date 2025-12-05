"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
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
  UserCog,
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
import { getFileUrl, formatDateForDisplay } from "@/lib/upload-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { useDoctors } from "@/hooks/doctor/useDoctors";

export default function MedicalDirectorTreatmentDetailPage() {
  const [noteSheetOpen, setNoteSheetOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [protocolSheetOpen, setProtocolSheetOpen] = useState(false);
  const [treatmentSheetOpen, setTreatmentSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);
  const [createOrderSheetOpen, setCreateOrderSheetOpen] = useState(false);
  const [consentSheetOpen, setConsentSheetOpen] = useState(false);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const queryClient = useQueryClient();
  const params = useParams();
  const id = params?.id as string | undefined;

  // Fetch doctors for reassignment
  const { doctors: doctorsData } = useDoctors();

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

  // Mutation for reassigning doctor
  const reassignMutation = useMutation({
    mutationFn: async (newDoctorId: number) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/treatments/${id}/reassign-doctor`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ newDoctorId }),
        }
      );
      if (!response.ok) throw new Error("Error al reasignar médico");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatmentDetail", id] });
      setReassignDialogOpen(false);
      setSelectedDoctorId("");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Cargando...</div>
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

  const handleReassignDoctor = () => {
    if (selectedDoctorId) {
      reassignMutation.mutate(Number(selectedDoctorId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-100 rounded-xl">
          <Stethoscope className="h-8 w-8 text-blue-600" />
        </div>
        <div className="flex justify-between items-center w-full">
          <div>
            <h1 className="text-3xl font-bold">DETALLE DEL TRATAMIENTO</h1>
            <p className="text-muted-foreground">
              Vista Director Médico - Acceso completo
            </p>
          </div>
          <div className="flex gap-3 items-center">
            {/* Indicador de estado del consentimiento */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Consentimiento:
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

            {/* Botones de acción para consentimiento */}
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

      {/* Alerta de Consentimiento */}
      {(!informedConsent || !informedConsent.pdfUri) && (
        <Alert variant="destructive" className="border-2">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">
            Consentimiento Informado Requerido
          </AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-2">
              {!informedConsent
                ? "Este tratamiento no tiene un consentimiento informado registrado."
                : "El consentimiento no tiene un documento PDF asociado."}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConsentSheetOpen(true)}
              className="mt-2 bg-white hover:bg-gray-50"
            >
              {!informedConsent ? "Crear Consentimiento" : "Cargar PDF"}
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
            <Link href={`/medical-director/patients/${patient.id}`}>
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
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-foreground">
                    {treatment.initialDoctor
                      ? `Dr. ${treatment.initialDoctor.firstName} ${treatment.initialDoctor.lastName}`
                      : "N/A"}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReassignDialogOpen(true)}
                    className="h-6 px-2"
                  >
                    <UserCog className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {treatment.startDate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Fecha de Inicio
                  </label>
                  <p className="mt-1 text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDateForDisplay(treatment.startDate)}
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
                    {formatDateForDisplay(treatment.closureDate)}
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
                  <Pill className="h-5 w-5 text-blue-600" />
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
                    {formatDateForDisplay(protocol.startDate)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Monitorings Section */}
          {monitorings.length > 0 && (
            <div className="border rounded-lg p-6 bg-card">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Monitoreos</h2>
              </div>
              <div className="space-y-4">
                {monitorings.map((monitoring: any) => (
                  <div
                    key={monitoring.id}
                    className="border-l-4 border-blue-500 pl-4 py-2"
                  >
                    <p className="font-medium">
                      Día {monitoring.dayNumber} -{" "}
                      {new Date(monitoring.monitoringDate).toLocaleDateString()}
                    </p>
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
                <ClipboardCheck className="h-5 w-5 text-blue-600" />
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
                          {formatDateForDisplay(note.noteDate)}
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
              <Button
                onClick={() => setCreateOrderSheetOpen(true)}
                disabled={!informedConsent || !informedConsent.pdfUri}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Orden Médica
              </Button>
            </div>

            {ordersLoading ? (
              <div className="text-center py-8">Cargando...</div>
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
                      <Link href={`/medical-director/medical-orders/${order.id}`}>
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
            <h3 className="font-semibold mb-3">ACCIONES DIRECTOR</h3>
            <Button
              variant="default"
              className="w-full justify-start bg-purple-600 hover:bg-purple-700"
              onClick={() => setReassignDialogOpen(true)}
            >
              <UserCog className="h-4 w-4 mr-2" />
              REASIGNAR MÉDICO
            </Button>
            <Button
              variant="default"
              className="w-full justify-start"
              onClick={() => setCreateOrderSheetOpen(true)}
              disabled={!informedConsent || !informedConsent.pdfUri}
            >
              <Plus className="h-4 w-4 mr-2" />
              NUEVA ORDEN MÉDICA
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleEditTreatment}
            >
              <FileText className="h-4 w-4 mr-2" />
              EDITAR TRATAMIENTO
            </Button>
            {patient && (
              <Link href={`/medical-director/patients/${patient.id}`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  VER PACIENTE
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Reassign Doctor Dialog */}
      <Dialog open={reassignDialogOpen} onOpenChange={setReassignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reasignar Médico</DialogTitle>
            <DialogDescription>
              Selecciona el nuevo médico responsable para este tratamiento.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
              Médico actual: {treatment.initialDoctor?.firstName} {treatment.initialDoctor?.lastName}
            </label>
            <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar nuevo médico" />
              </SelectTrigger>
              <SelectContent>
                {doctorsData?.map((doctor: any) => (
                  <SelectItem key={doctor.id} value={String(doctor.id)}>
                    Dr. {doctor.firstName} {doctor.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReassignDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReassignDoctor}
              disabled={!selectedDoctorId || reassignMutation.isPending}
            >
              {reassignMutation.isPending ? "Reasignando..." : "Reasignar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
