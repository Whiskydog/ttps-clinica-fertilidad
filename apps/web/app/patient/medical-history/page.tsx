"use client";
import { useQuery } from "@tanstack/react-query";
import { getMedicalHistory } from "@/app/actions/patients/medical-history/get";

import { MedicalHistoryResponse } from "@repo/contracts";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import Link from "next/link";
import { HabitsSection } from "@/components/patient/medical-history/habits-section";
import { FenotypeSection } from "@/components/patient/medical-history/fenotype-section";
import { BackgroundsSection } from "@/components/patient/medical-history/backgrounds-section";
import { EmptyState } from "@/components/patient/empty-state";

export default function MedicalHistorySummary() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["medicalHistory"],
    queryFn: () =>
      getMedicalHistory().then((res) => res.data as MedicalHistoryResponse),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Cargando historia clínica...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-container">
        <Link href="/patient">
          <Button variant="link">← Volver a inicio</Button>
        </Link>
        <EmptyState
          icon="medical-history"
          title="No hay historia clínica disponible"
          description="Aún no tienes una historia clínica registrada. Para comenzar tu tratamiento, primero debes sacar un turno con uno de nuestros especialistas."
          showAppointmentButton={true}
          showHomeButton={true}
        />
      </div>
    );
  }

  const {
    patient,
    partnerData,
    gynecologicalHistory,
    habits,
    fenotypes,
    backgrounds,
  } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/patient">
          <Button variant="link">← Volver al Dashboard</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Historia Clínica</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="mb-2">
            <strong>Fecha de creación:</strong>{" "}
            {new Date(data.createdAt).toLocaleDateString()}
          </div>
          {patient && (
            <div className="mb-4">
              <h3 className="section-title">Datos del Paciente</h3>
              <div className="grid grid-cols-2 gap-x-4 text-sm">
                <div>
                  <strong>Nombre:</strong> {patient.firstName}{" "}
                  {patient.lastName}
                </div>
                <div>
                  <strong>DNI:</strong> {patient.dni}
                </div>
                <div>
                  <strong>Email:</strong> {patient.email}
                </div>
                <div>
                  <strong>Fecha de nacimiento:</strong>{" "}
                  {patient.dateOfBirth
                    ? new Date(patient.dateOfBirth).toLocaleDateString()
                    : "-"}
                </div>
                <div>
                  <strong>Ocupación:</strong> {patient.occupation || "-"}
                </div>
                <div>
                  <strong>Sexo biológico:</strong>{" "}
                  {patient.biologicalSex || "-"}
                </div>
              </div>
            </div>
          )}
          <div className="mb-2">
            <strong>Examen físico:</strong>{" "}
            {data.physicalExamNotes || "No registrado"}
          </div>
          <div className="mb-2">
            <strong>Antecedentes familiares:</strong>{" "}
            {data.familyBackgrounds || "No registrado"}
          </div>
          {partnerData && (
            <div className="mb-4">
              <h3 className="section-title">Datos de la Pareja</h3>
              <div className="grid grid-cols-2 gap-x-4 text-sm">
                <div>
                  <strong>Nombre:</strong> {partnerData.firstName}{" "}
                  {partnerData.lastName}
                </div>
                <div>
                  <strong>DNI:</strong> {partnerData.dni}
                </div>
                <div>
                  <strong>Fecha de nacimiento:</strong>{" "}
                  {partnerData.birthDate || "-"}
                </div>
                <div>
                  <strong>Sexo biológico:</strong>{" "}
                  {partnerData.biologicalSex || "-"}
                </div>
                <div>
                  <strong>Ocupación:</strong> {partnerData.occupation || "-"}
                </div>
                <div>
                  <strong>Email:</strong> {partnerData.email || "-"}
                </div>
                <div>
                  <strong>Teléfono:</strong> {partnerData.phone || "-"}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {gynecologicalHistory && gynecologicalHistory.length > 0 && (
        <Card className="mb-4">
          {/* Filtrar antecedentes de la paciente y de la pareja */}
          <CardHeader>
            <CardTitle className="text-xl">
              Antecedentes Ginecológicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Paciente */}
            {gynecologicalHistory.filter((g) => !g.partnerData).length > 0 && (
              <div className="mb-4 p-4 rounded-md bg-pink-50 border-pink-200">
                <h4 className="font-semibold text-pink-700 mb-2 text-base">
                  Paciente
                </h4>
                {gynecologicalHistory
                  .filter((g) => !g.partnerData)
                  .map((g) => (
                    <div
                      key={g.id}
                      className="mb-2 border-b pb-2 last:border-b-0 last:pb-0"
                    >
                      <div className="grid grid-cols-2 gap-x-4 text-sm">
                        <div>
                          <strong>Menarquia:</strong> {g.menarcheAge ?? "-"}
                        </div>
                        <div>
                          <strong>Regularidad del ciclo:</strong>{" "}
                          {g.cycleRegularity ?? "-"}
                        </div>
                        <div>
                          <strong>Duración del ciclo:</strong>{" "}
                          {g.cycleDurationDays ?? "-"}
                        </div>
                        <div>
                          <strong>Características del sangrado:</strong>{" "}
                          {g.bleedingCharacteristics ?? "-"}
                        </div>
                        <div>
                          <strong>Gestaciones:</strong> {g.gestations ?? "-"}
                        </div>
                        <div>
                          <strong>Partos:</strong> {g.births ?? "-"}
                        </div>
                        <div>
                          <strong>Abortos:</strong> {g.abortions ?? "-"}
                        </div>
                        <div>
                          <strong>Embarazos ectópicos:</strong>{" "}
                          {g.ectopicPregnancies ?? "-"}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
            {/* Pareja ROPA */}
            {gynecologicalHistory.filter((g) => g.partnerData).length > 0 && (
              <div className="mb-4 p-4 rounded-md bg-blue-50 border-blue-200">
                <h4 className="font-semibold text-blue-700 mb-2 text-base">
                  Pareja (ROPA)
                </h4>
                {gynecologicalHistory
                  .filter((g) => g.partnerData)
                  .map((g) => (
                    <div
                      key={g.id}
                      className="mb-2 border-b pb-2 last:border-b-0 last:pb-0"
                    >
                      <div className="grid grid-cols-2 gap-x-4 text-sm">
                        <div className="col-span-2 text-xs text-blue-500 mb-1">
                          {g.partnerData?.firstName || ""}{" "}
                          {g.partnerData?.lastName || ""} (
                          {g.partnerData?.dni || ""})
                        </div>
                        <div>
                          <strong>Menarquia:</strong> {g.menarcheAge ?? "-"}
                        </div>
                        <div>
                          <strong>Regularidad del ciclo:</strong>{" "}
                          {g.cycleRegularity ?? "-"}
                        </div>
                        <div>
                          <strong>Duración del ciclo:</strong>{" "}
                          {g.cycleDurationDays ?? "-"}
                        </div>
                        <div>
                          <strong>Características del sangrado:</strong>{" "}
                          {g.bleedingCharacteristics ?? "-"}
                        </div>
                        <div>
                          <strong>Gestaciones:</strong> {g.gestations ?? "-"}
                        </div>
                        <div>
                          <strong>Partos:</strong> {g.births ?? "-"}
                        </div>
                        <div>
                          <strong>Abortos:</strong> {g.abortions ?? "-"}
                        </div>
                        <div>
                          <strong>Embarazos ectópicos:</strong>{" "}
                          {g.ectopicPregnancies ?? "-"}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Nuevas secciones */}
      <HabitsSection habits={habits || []} />
      <FenotypeSection fenotypes={fenotypes || []} />
      <BackgroundsSection backgrounds={backgrounds || []} />

      {/* <pre>{JSON.stringify({ ...data }, null, 2)}</pre> */}
    </div>
  );
}
