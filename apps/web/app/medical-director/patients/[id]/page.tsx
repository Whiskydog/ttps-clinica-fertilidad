"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMedicalHistory } from "@/app/actions/medical-history/get";
import { getPatientTreatments } from "@/app/actions/doctor/patients/get-treatments";
import { MedicalHistoryResponse } from "@repo/contracts";
import { HabitsCard } from "@/components/doctor/medical-history/cards/habits-card";
import { BackgroundsCard } from "@/components/doctor/medical-history/cards/backgrounds-card";
import { GynecologicalCard } from "@/components/doctor/medical-history/cards/gynecological-card";
import { PhysicalExamCard } from "@/components/doctor/medical-history/cards/physical-exam-card";
import { FamilyBackgroundsCard } from "@/components/doctor/medical-history/cards/family-backgrounds-card";
import { PartnerDataCard } from "@/components/doctor/medical-history/cards/partner-data-card";
import {
  FileText,
  User,
  AlertCircle,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";

export default function MedicalDirectorPatientPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<MedicalHistoryResponse | null>({
    queryKey: ["medicalHistory", id],
    queryFn: async () => {
      if (!id) return null;
      const payload = await getMedicalHistory(Number(id));
      return payload?.data as MedicalHistoryResponse | null;
    },
    enabled: !!id,
  });

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
          <div className="text-lg">Cargando...</div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="page-container">
        <div className="flex items-center gap-2 p-4 border border-red-200 bg-red-50 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Error al cargar historia clínica</h3>
            <p className="text-sm text-red-700">{(error as Error).message}</p>
          </div>
        </div>
      </div>
    );

  if (!data)
    return (
      <div className="page-container">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Historia clínica no encontrada</h3>
          <p className="text-muted-foreground">
            No se encontró la historia clínica para este paciente.
          </p>
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Historia Clínica</h1>
            <p className="text-muted-foreground">Vista Director Médico</p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/medical-director/patients">
            Volver a Pacientes
          </Link>
        </Button>
      </div>

      {/* Patient Info Card */}
      <div className="border rounded-lg p-4 bg-card">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {data.patient?.firstName} {data.patient?.lastName}
            </h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
              <p>DNI: {data.patient?.dni}</p>
              <p>Fecha de Nacimiento: {data.patient?.dateOfBirth}</p>
              <p>
                Fecha de Ingreso:{" "}
                {new Date(data.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Medical History Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      <div className="border rounded-lg bg-card">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Stethoscope className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold">Tratamientos</h2>
          </div>
        </div>
        <div className="p-4">
          {treatmentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Cargando tratamientos...</div>
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
                        <p>
                          <span className="font-medium">Médico:</span>{" "}
                          {treatment.initialDoctor?.firstName} {treatment.initialDoctor?.lastName}
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
                    <Link href={`/medical-director/treatments/${treatment.id}`}>
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
    </div>
  );
}
