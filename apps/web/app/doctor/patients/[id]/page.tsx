"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMedicalHistory } from "@/app/actions/medical-history/get";
import { getPatientTreatments } from "@/app/actions/doctor/patients/get-treatments";
import { MedicalHistoryResponse } from "@repo/contracts";
import { HabitsCard } from "@/components/doctor/medical-history/cards/habits-card";
import { BackgroundsCard } from "@/components/doctor/medical-history/cards/backgrounds-card";
import { GynecologicalCard } from "@/components/doctor/medical-history/cards/gynecological-card";
import { PhysicalExamCard } from "@/components/doctor/medical-history/cards/physical-exam-card";
import { FamilyBackgroundsCard } from "@/components/doctor/medical-history/cards/family-backgrounds-card";
import { PartnerDataCard } from "@/components/doctor/medical-history/cards/partner-data-card";
import { FileText, User, AlertCircle, Stethoscope } from "lucide-react";
import Link from "next/link";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { createTreatment } from "@/app/actions/doctor/patients/create-treatment";
import { toast } from "@repo/ui";
import { Spinner } from "@repo/ui/spinner";

export default function DoctorPatientMedicalHistoryPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const queryClient = useQueryClient();
  const [showCreateTreatment, setShowCreateTreatment] = React.useState(false);
  const [initialObjective, setInitialObjective] = React.useState("");

  const createTreatmentMutation = useMutation({
    mutationFn: async ({
      medicalHistoryId,
      initialObjective,
    }: {
      medicalHistoryId: number;
      initialObjective: string;
    }) => await createTreatment(medicalHistoryId, initialObjective),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ["patientTreatments", id],
      });
      toast.success(response.message);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear el tratamiento");
    },
    onSettled: () => {
      setShowCreateTreatment(false);
      setInitialObjective("");
    },
  });

  const { data, isLoading, error } = useQuery<MedicalHistoryResponse | null>({
    queryKey: ["medicalHistory", id],
    queryFn: async () => {
      if (!id) return null;
      const payload = await getMedicalHistory(Number(id));
      return payload?.data as MedicalHistoryResponse | null;
    },
    enabled: !!id,
  });

  async function handleCreateTreatment() {
    if (!initialObjective) return;

    createTreatmentMutation.mutate({
      medicalHistoryId: Number(data?.id),
      initialObjective,
    });
  }

  // Get patient treatments
  const { data: treatmentsData, isLoading: treatmentsLoading } = useQuery({
    queryKey: ["patientTreatments", id],
    queryFn: async () => {
      if (!id) return null;
      const payload = await getPatientTreatments(Number(id));
      return payload?.data || [];
    },
    enabled: !!id,
  });

  if (isLoading)
    return (
      <div className="page-container">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="page-container">
        <div className="error-message fade-in">
          <AlertCircle className="error-icon h-5 w-5" />
          <div>
            <h3 className="font-semibold">Error al cargar historia clínica</h3>
            <p className="text-sm mt-1">{(error as Error).message}</p>
          </div>
        </div>
      </div>
    );

  if (!data)
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">
            <FileText className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="empty-state-title">Historia clínica no encontrada</h3>
          <p className="empty-state-description">
            No se encontró la historia clínica para este paciente.
          </p>
        </div>
      </div>
    );

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-heading-1 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            Historia Clínica
          </h1>
        </div>
      </div>

      {/* Patient Info Card */}
      <div className="border rounded-lg p-4 bg-card mb-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {data.patient?.firstName} {data.patient?.lastName}
            </h3>
            <div className="flex items-center gap-4 mt-2 text-small text-muted-foreground">
              <p className="text-sm text-muted-foreground">
                DNI: {data.patient?.dni}
              </p>
              <p className="text-sm text-muted-foreground">
                Fecha de Nacimiento: {data.patient?.dateOfBirth}
              </p>
              <p className="text-sm text-muted-foreground">
                Fecha de Ingreso:{" "}
                {new Date(data.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Medical History Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Column */}
        <div className="space-y-6">
          <BackgroundsCard
            backgrounds={data.backgrounds}
            medicalHistoryId={data.id}
            onUpdate={() =>
              queryClient.invalidateQueries({
                queryKey: ["medicalHistory", id],
              })
            }
          />

          <FamilyBackgroundsCard
            familyBackgrounds={data.familyBackgrounds}
            medicalHistoryId={data.id}
            onUpdate={() =>
              queryClient.invalidateQueries({
                queryKey: ["medicalHistory", id],
              })
            }
          />

          <PhysicalExamCard
            fenotype={data.fenotypes?.[0]}
            physicalExamNotes={data.physicalExamNotes}
            medicalHistoryId={data.id}
            onUpdate={() =>
              queryClient.invalidateQueries({
                queryKey: ["medicalHistory", id],
              })
            }
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <HabitsCard
            habits={data.habits?.[0]}
            medicalHistoryId={data.id}
            onUpdate={() =>
              queryClient.invalidateQueries({
                queryKey: ["medicalHistory", id],
              })
            }
          />

          <GynecologicalCard
            gynecologicalHistory={
              data.gynecologicalHistory?.find((g) => !g.partnerData) || null
            }
            medicalHistoryId={data.id}
            onUpdate={() =>
              queryClient.invalidateQueries({
                queryKey: ["medicalHistory", id],
              })
            }
          />

          <PartnerDataCard
            partnerData={data.partnerData}
            medicalHistoryId={data.id}
            onUpdate={() =>
              queryClient.invalidateQueries({
                queryKey: ["medicalHistory", id],
              })
            }
          />
        </div>
      </div>

      {/* Treatments Section */}
      <div className="card mt-8">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-heading-2">Tratamientos</h2>
          </div>
        </div>
        <div className="card-content">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowCreateTreatment(true)}>
              Iniciar Tratamiento Nuevo
            </Button>
          </div>

          {treatmentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="loading-spinner"></div>
            </div>
          ) : !treatmentsData || treatmentsData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay tratamientos registrados para este paciente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {treatmentsData.map((treatment: any) => (
                <div
                  key={treatment.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">
                          Tratamiento #{treatment.id}
                        </h3>
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
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>
                          <span className="font-medium">Objetivo:</span>{" "}
                          {treatment.initialObjective?.replace(/_/g, " ")}
                        </p>
                        {treatment.startDate && (
                          <p>
                            <span className="font-medium">Inicio:</span>{" "}
                            {new Date(treatment.startDate).toLocaleDateString()}
                          </p>
                        )}
                        {treatment.closureDate && (
                          <p>
                            <span className="font-medium">Cierre:</span>{" "}
                            {new Date(
                              treatment.closureDate
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <Link href={`/doctor/treatments/${treatment.id}`}>
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
      {showCreateTreatment && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[400px]">
            <h2 className="text-xl font-semibold mb-4">Crear Tratamiento</h2>

            <label className="block text-sm font-medium mb-2">
              Objetivo Inicial
            </label>

            <select
              className="w-full border rounded px-3 py-2 mb-4"
              value={initialObjective}
              onChange={(e) => setInitialObjective(e.target.value)}
            >
              <option value="">Seleccione...</option>

              <option value="gametos_propios">Gametos propios</option>

              <option value="couple_female">Pareja femenina</option>

              <option value="method_ropa">Método ROPA</option>

              <option value="woman_single">Mujer sola</option>

              <option value="preservation_ovocytes_embryos">
                Preservación de óvulos / embriones
              </option>
            </select>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateTreatment(false)}
              >
                Cancelar
              </Button>
              <Button
                disabled={createTreatmentMutation.isPending}
                onClick={handleCreateTreatment}
              >
                {createTreatmentMutation.isPending ? (
                  <>
                    Creando <Spinner />
                  </>
                ) : (
                  "Crear"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
