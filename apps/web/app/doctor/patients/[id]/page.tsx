"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {toast} from "@repo/ui";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertPartner } from "@/app/actions/medical-history/partner";
import { upsertGynecological } from "@/app/actions/medical-history/gynecological";
import { updateMedicalHistory } from "@/app/actions/medical-history/update";
import { getMedicalHistory } from "@/app/actions/medical-history/get";
import {
  GynecologicalHistory,
  PartnerData,
  CycleRegularity,
  MedicalHistoryResponse,
  PartnerWithGynecology,
  MedicalDataState,
} from "@repo/contracts";
import { PhysicalExamSection } from "@/components/medical-history/PhysicalExamSection";
import { PatientGynecologySection } from "@/components/medical-history/PatientGynecologySection";
import { PartnerDataSection } from "@/components/medical-history/PartnerDataSection";
import { FileText, User, Calendar, AlertCircle } from "lucide-react";

export default function DoctorPatientMedicalHistoryPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const queryClient = useQueryClient();

  // Estado unificado para toda la información médica
  const [medicalData, setMedicalData] = useState<MedicalDataState>({
    physicalExamNotes: "",
    familyBackgrounds: "",
    partner: {
      firstName: "",
      lastName: "",
      dni: "",
      birthDate: "",
      occupation: "",
      phone: "",
      email: "",
      biologicalSex: "male",
      genitalBackgrounds: "",
      menarcheAge: null,
      cycleRegularity: null,
      cycleDurationDays: null,
      bleedingCharacteristics: null,
      gestations: null,
      births: null,
      abortions: null,
      ectopicPregnancies: null,
    } as PartnerWithGynecology,
    patientGynecology: {
      menarcheAge: null,
      cycleRegularity: null,
      cycleDurationDays: null,
      bleedingCharacteristics: null,
      gestations: null,
      births: null,
      abortions: null,
      ectopicPregnancies: null,
    } as GynecologicalHistory,
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

  // Helper functions for data loading
  const loadPartnerData = (
    partnerData: NonNullable<MedicalHistoryResponse["partnerData"]>
  ) => ({
    firstName: partnerData.firstName || "",
    lastName: partnerData.lastName || "",
    dni: partnerData.dni || "",
    birthDate: partnerData.birthDate?.slice(0, 10) || "",
    occupation: partnerData.occupation || "",
    phone: partnerData.phone || "",
    email: partnerData.email || "",
    biologicalSex: partnerData.biologicalSex,
    genitalBackgrounds: partnerData.genitalBackgrounds || "",
  });

  const loadPartnerGynecology = (
    gyneList: GynecologicalHistory[],
    partnerId: number
  ) => {
    const partnerGyne = gyneList.find(
      (g: GynecologicalHistory) => g.partnerData?.id === partnerId
    );
    if (!partnerGyne) return {};

    return {
      menarcheAge:
        typeof partnerGyne.menarcheAge === "number"
          ? partnerGyne.menarcheAge
          : null,
      cycleRegularity: partnerGyne.cycleRegularity ?? null,
      cycleDurationDays:
        typeof partnerGyne.cycleDurationDays === "number"
          ? partnerGyne.cycleDurationDays
          : null,
      bleedingCharacteristics: partnerGyne.bleedingCharacteristics || null,
      gestations:
        typeof partnerGyne.gestations === "number"
          ? partnerGyne.gestations
          : null,
      births:
        typeof partnerGyne.births === "number" ? partnerGyne.births : null,
      abortions:
        typeof partnerGyne.abortions === "number"
          ? partnerGyne.abortions
          : null,
      ectopicPregnancies:
        typeof partnerGyne.ectopicPregnancies === "number"
          ? partnerGyne.ectopicPregnancies
          : null,
    };
  };

  const loadPatientGynecology = (gyneList: GynecologicalHistory[]) => {
    const patientGyne = gyneList.find(
      (g: GynecologicalHistory) => !g.partnerData
    );
    if (!patientGyne) return {};

    return {
      menarcheAge: patientGyne.menarcheAge ?? null,
      cycleRegularity:
        typeof patientGyne.cycleRegularity === "string"
          ? Object.values(CycleRegularity).includes(
              patientGyne.cycleRegularity as CycleRegularity
            )
            ? (patientGyne.cycleRegularity as CycleRegularity)
            : null
          : (patientGyne.cycleRegularity ?? null),
      cycleDurationDays: patientGyne.cycleDurationDays ?? null,
      bleedingCharacteristics: patientGyne.bleedingCharacteristics ?? null,
      gestations: patientGyne.gestations ?? null,
      births: patientGyne.births ?? null,
      abortions: patientGyne.abortions ?? null,
      ectopicPregnancies: patientGyne.ectopicPregnancies ?? null,
    };
  };

  useEffect(() => {
    if (!data) return;

    setMedicalData((prev) => ({
      ...prev,
      physicalExamNotes: data.physicalExamNotes || "",
      familyBackgrounds: data.familyBackgrounds || "",
    }));

    if (data.partnerData) {
      const partnerData = loadPartnerData(data.partnerData);
      setMedicalData((prev) => ({
        ...prev,
        partner: { ...prev.partner, ...partnerData },
      }));
    }

    const gyneList = data.gynecologicalHistory || [];

    if (data.partnerData?.id) {
      const partnerGynecology = loadPartnerGynecology(
        gyneList,
        data.partnerData.id
      );
      setMedicalData((prev) => ({
        ...prev,
        partner: { ...prev.partner, ...partnerGynecology },
      }));
    }

    const patientGynecology = loadPatientGynecology(gyneList);
    setMedicalData((prev) => ({
      ...prev,
      patientGynecology: { ...prev.patientGynecology, ...patientGynecology },
    }));
  }, [data]);

  // Mutations
  const mutation = useMutation<
    unknown,
    Error,
    { id: number; physicalExamNotes: string; familyBackgrounds: string }
  >({
    mutationFn: updateMedicalHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicalHistory", id] });
      toast.success("Actualizado");
    },
    onError: (err: Error) =>
      toast.error(err?.message || "No se pudo actualizar"),
  });

  const partnerMutation = useMutation<
    unknown,
    Error,
    {
      medicalHistoryId: number;
      partnerData: PartnerData;
      gynecologicalHistory?: GynecologicalHistory;
    }
  >({
    mutationFn: upsertPartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicalHistory", id] });
      toast.success("Datos de pareja guardados");
    },
    onError: (err: Error) =>
      toast.error(err?.message || "No se pudo guardar datos de pareja"),
  });

  const gyneMutation = useMutation<
    unknown,
    Error,
    { medicalHistoryId: number; gynecologicalHistory: GynecologicalHistory }
  >({
    mutationFn: upsertGynecological,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicalHistory", id] });
      toast.success("Historia ginecológica guardada");
    },
    onError: (err: Error) =>
      toast.error(err?.message || "No se pudo guardar historia ginecológica"),
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
      <div className="card mb-8">
        <div className="card-content">
          <div className="flex items-start gap-4">
            <div className="patient-card-avatar">
              <User className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                {data.patient?.firstName} {data.patient?.lastName}
              </h3>
              <div className="flex items-center gap-4 mt-2 text-small text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  DNI:{" "}
                  <span className="font-mono bg-muted px-2 py-1 rounded text-xs">
                    {data.patient?.dni}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Creado: {new Date(data.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Medical History Sections */}
      <div className="section-spacing">
        {/* Examen físico y antecedentes familiares */}
        <PhysicalExamSection
          medicalData={medicalData}
          setMedicalData={setMedicalData}
          onSubmit={() =>
            mutation.mutate({
              id: data.id,
              physicalExamNotes: medicalData.physicalExamNotes,
              familyBackgrounds: medicalData.familyBackgrounds,
            })
          }
          isPending={mutation.isPending}
        />

        {/* Historia ginecológica paciente */}
        <PatientGynecologySection
          medicalData={medicalData}
          setMedicalData={setMedicalData}
          onSubmit={() =>
            gyneMutation.mutate({
              medicalHistoryId: data.id,
              gynecologicalHistory: { ...medicalData.patientGynecology },
            })
          }
          isPending={gyneMutation.isPending}
          biologicalSex={data.patient?.biologicalSex}
        />

        {/* Datos de la pareja */}
        <PartnerDataSection
          medicalData={medicalData}
          setMedicalData={setMedicalData}
          onSubmit={() => {
            const payload: {
              medicalHistoryId: number;
              partnerData: PartnerData;
              gynecologicalHistory?: GynecologicalHistory;
            } = {
              medicalHistoryId: data.id,
              partnerData: { ...medicalData.partner },
            };
            if (medicalData.partner.biologicalSex === "female") {
              payload.gynecologicalHistory = {
                menarcheAge: medicalData.partner.menarcheAge ?? undefined,
                cycleRegularity:
                  typeof medicalData.partner.cycleRegularity === "string"
                    ? Object.values(CycleRegularity).includes(
                        medicalData.partner.cycleRegularity as CycleRegularity
                      )
                      ? (medicalData.partner.cycleRegularity as CycleRegularity)
                      : null
                    : (medicalData.partner.cycleRegularity ?? null),
                cycleDurationDays:
                  medicalData.partner.cycleDurationDays ?? undefined,
                bleedingCharacteristics:
                  medicalData.partner.bleedingCharacteristics ?? undefined,
                gestations: medicalData.partner.gestations ?? undefined,
                births: medicalData.partner.births ?? undefined,
                abortions: medicalData.partner.abortions ?? undefined,
                ectopicPregnancies:
                  medicalData.partner.ectopicPregnancies ?? undefined,
              };
            }
            partnerMutation.mutate(payload);
          }}
          isPending={partnerMutation.isPending}
        />
      </div>
    </div>
  );
}
