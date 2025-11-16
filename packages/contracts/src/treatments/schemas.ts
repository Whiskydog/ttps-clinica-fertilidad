import { z } from "zod";
import { InitialObjective, TreatmentStatus, MilestoneType, MilestoneResult } from "./enums";
import { UserEntitySchema } from "../users";

export const InitialObjectiveEnum = z.enum(
  Object.values(InitialObjective) as [string, ...string[]],
);

export const TreatmentStatusEnum = z.enum(
  Object.values(TreatmentStatus) as [string, ...string[]],
);

export const CreateTreatmentSchema = z.object({
  initial_objective: InitialObjectiveEnum,
});

export type CreateTreatmentDtoType = z.infer<typeof CreateTreatmentSchema>;

export const CreateTreatmentResponseSchema = z.object({
  id: z.number(),
  initialObjective: InitialObjectiveEnum,
  status: TreatmentStatusEnum,
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type CreateTreatmentResponseDtoType = z.infer<
  typeof CreateTreatmentResponseSchema
>;

// ============================================
// Schemas para respuestas de API
// ============================================

// Tratamiento (usado en current treatment y history)
export const TreatmentSchema = z.object({
  id: z.number(),
  initialObjective: z.string(),
  startDate: z.string().nullable(),
  status: z.string(),
  closureReason: z.string().nullable().optional(),
  closureDate: z.string().nullable().optional(),
  initialDoctor: UserEntitySchema.nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Treatment = z.infer<typeof TreatmentSchema>;

// Monitoreo
export const MonitoringSchema = z.object({
  id: z.number(),
  treatmentId: z.number(),
  monitoringDate: z.string(),
  dayNumber: z.number().nullable(),
  follicleCount: z.number().nullable(),
  follicleSize: z.string().nullable(),
  estradiolLevel: z.number().nullable(),
  observations: z.string().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Monitoring = z.infer<typeof MonitoringSchema>;

// Protocolo de medicación
export const MedicationProtocolSchema = z.object({
  id: z.number(),
  treatmentId: z.number(),
  medications: z.array(
    z.object({
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      duration: z.string().optional(),
    }),
  ),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  instructions: z.string().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type MedicationProtocol = z.infer<typeof MedicationProtocolSchema>;

// Nota del doctor
export const DoctorNoteSchema = z.object({
  id: z.number(),
  treatmentId: z.number(),
  noteDate: z.string(),
  content: z.string(),
  doctor: UserEntitySchema.optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type DoctorNote = z.infer<typeof DoctorNoteSchema>;

// ============================================
// New Schemas for Treatment Extensions
// ============================================

// Informed Consent Schema
export const InformedConsentSchema = z.object({
  id: z.number(),
  treatmentId: z.number(),
  pdfUri: z.string().nullable(),
  signatureDate: z.iso.datetime().nullable(),
  uploadedByUserId: z.number().nullable(),
  uploadedByUser: UserEntitySchema.nullable().optional(),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
});

export type InformedConsent = z.infer<typeof InformedConsentSchema>;

// Post Transfer Milestone Schema
export const PostTransferMilestoneSchema = z.object({
  id: z.number(),
  treatmentId: z.number(),
  milestoneType: z.nativeEnum(MilestoneType),
  result: z.string().max(20).nullable(),
  milestoneDate: z.iso.datetime().nullable(),
  registeredByDoctorId: z.number().nullable(),
  registeredByDoctor: UserEntitySchema.nullable().optional(),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
});

export type PostTransferMilestone = z.infer<typeof PostTransferMilestoneSchema>;

// Medical Coverage Schema
export const MedicalCoverageSchema = z.object({
  id: z.number(),
  medicalInsuranceId: z.number(),
  treatmentId: z.number(),
  coveragePercentage: z.number().nullable(), // decimal 5,2
  patientDue: z.number().nullable(), // decimal 10,2
  insuranceDue: z.number().nullable(), // decimal 10,2
  medicalInsurance: z.object({
    id: z.number(),
    name: z.string(),
  }).optional(),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
});

export type MedicalCoverage = z.infer<typeof MedicalCoverageSchema>;

// Detalle completo de tratamiento
export const TreatmentDetailSchema = z.object({
  treatment: TreatmentSchema,
  monitorings: z.array(MonitoringSchema).optional(),
  protocol: MedicationProtocolSchema.nullable().optional(),
  doctorNotes: z.array(DoctorNoteSchema).optional(),
  informedConsent: InformedConsentSchema.nullable().optional(),
  milestones: z.array(PostTransferMilestoneSchema).optional(),
  medicalCoverage: MedicalCoverageSchema.nullable().optional(),
});

export type TreatmentDetail = z.infer<typeof TreatmentDetailSchema>;

// ============================================
// Input/Upsert Schemas for Treatment Extensions
// ============================================

// Informed Consent Input Schemas
export const CreateInformedConsentSchema = z.object({
  treatmentId: z.number(),
  pdfUri: z.string().nullable().optional(),
  signatureDate: z.iso.datetime().nullable().optional(),
  uploadedByUserId: z.number().nullable().optional(),
});

export const UpdateInformedConsentSchema = CreateInformedConsentSchema.partial().extend({
  id: z.number(),
});

export type CreateInformedConsentInput = z.infer<typeof CreateInformedConsentSchema>;
export type UpdateInformedConsentInput = z.infer<typeof UpdateInformedConsentSchema>;

// Post Transfer Milestone Input Schemas
export const CreatePostTransferMilestoneSchema = z.object({
  treatmentId: z.number(),
  milestoneType: z.nativeEnum(MilestoneType),
  result: z.string().max(20).nullable().optional(),
  milestoneDate: z.iso.datetime().nullable().optional(),
  registeredByDoctorId: z.number().nullable().optional(),
});

export const UpdatePostTransferMilestoneSchema = CreatePostTransferMilestoneSchema.partial().extend({
  id: z.number(),
});

export type CreatePostTransferMilestoneInput = z.infer<typeof CreatePostTransferMilestoneSchema>;
export type UpdatePostTransferMilestoneInput = z.infer<typeof UpdatePostTransferMilestoneSchema>;

// Medical Coverage Input Schemas
export const CreateMedicalCoverageSchema = z.object({
  medicalInsuranceId: z.number(),
  treatmentId: z.number(),
  coveragePercentage: z.number().nullable().optional(),
  patientDue: z.number().nullable().optional(),
  insuranceDue: z.number().nullable().optional(),
});

export const UpdateMedicalCoverageSchema = CreateMedicalCoverageSchema.partial().extend({
  id: z.number(),
});

export type CreateMedicalCoverageInput = z.infer<typeof CreateMedicalCoverageSchema>;
export type UpdateMedicalCoverageInput = z.infer<typeof UpdateMedicalCoverageSchema>;
