import { z } from "zod";
import {
  InitialObjective,
  TreatmentStatus,
  MilestoneType,
  MilestoneResult,
} from "./enums";
import { UserEntitySchema } from "../users";
import { ApiResponseSchema } from "../common/api";
import moment from "moment";
export type MonitoringPlan = z.infer<typeof MonitoringPlanSchema>;

export const InitialObjectiveEnum = z.enum(
  Object.values(InitialObjective) as [string, ...string[]]
);

export const TreatmentStatusEnum = z.enum(
  Object.values(TreatmentStatus) as [string, ...string[]]
);

export const CreateTreatmentSchema = z.object({
  initial_objective: InitialObjectiveEnum,
  medicalOrderIds: z.array(z.number()).optional(),
});

export type CreateTreatmentDtoType = z.infer<typeof CreateTreatmentSchema>;

export const CreateTreatmentResponseSchema = ApiResponseSchema(
  z.object({
    id: z.number(),
    initialObjective: InitialObjectiveEnum,
    status: TreatmentStatusEnum,
    startDate: z
      .date()
      .transform((date) => moment.utc(date).format("YYYY-MM-DD"))
      .nullable(),
  })
);

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

export const MonitoringPlanStatusEnum = z.enum([
  "PLANNED",
  "RESERVED",
  "COMPLETED",
  "CANCELLED",
]);

export const CreateMonitoringPlanSchema = z.object({
  treatmentId: z.number(),
  sequence: z.number().min(1),
  plannedDay: z.number().nullable().optional(),
  minDate: z.string(), // YYYY-MM-DD
  maxDate: z.string(), // YYYY-MM-DD
});
export const CreateMonitoringPlansSchema = z.object({
  treatmentId: z.number(),
  rows: z
    .array(
      z.object({
        sequence: z.number().min(1),
        plannedDay: z.number().min(1).max(31),
      })
    )
    .min(1),
});
export const UpdateMonitoringPlanSchema = z.object({
  id: z.number(),
  status: MonitoringPlanStatusEnum.optional(),
  appointmentId: z.number().nullable().optional(),
});

export type CreateMonitoringPlanDto = z.infer<
  typeof CreateMonitoringPlanSchema
>;
export type UpdateMonitoringPlanDto = z.infer<
  typeof UpdateMonitoringPlanSchema
>;
export const MonitoringPlanSchema = z.object({
  id: z.number(),
  treatmentId: z.number(),
  sequence: z.number(),
  plannedDay: z.number().nullable(),
  minDate: z.string(),
  maxDate: z.string(),
  status: MonitoringPlanStatusEnum,
  appointmentId: z.number().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Protocolo de medicación
export const MedicationProtocolSchema = z.object({
  id: z.number(),
  treatmentId: z.number(),
  protocolType: z.string(),
  drugName: z.string(),
  dose: z.string(),
  administrationRoute: z.string(),
  duration: z.string().nullable(),
  startDate: z.string().nullable(),
  additionalMedication: z.array(z.string()).nullable(),
  consentSigned: z.boolean().optional(),
  consentDate: z.string().nullable().optional(),
  pdfUrl: z.string().nullable().optional(),
  pdfGeneratedAt: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type MedicationProtocol = z.infer<typeof MedicationProtocolSchema>;

// Nota del doctor
export const DoctorNoteSchema = z.object({
  id: z.number(),
  treatmentId: z.number(),
  noteDate: z.string(),
  note: z.string(),
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
  signatureDate: z.string().nullable(),
  uploadedByUserId: z.number().nullable(),
  uploadedByUser: UserEntitySchema.nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type InformedConsent = z.infer<typeof InformedConsentSchema>;

// Post Transfer Milestone Schema
export const PostTransferMilestoneSchema = z.object({
  id: z.number(),
  treatmentId: z.number(),
  milestoneType: z.nativeEnum(MilestoneType),
  result: z.string().max(20).nullable(),
  milestoneDate: z.string().nullable(),
  registeredByDoctorId: z.number().nullable(),
  registeredByDoctor: UserEntitySchema.nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
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
  medicalInsurance: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
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
  monitoringPlans: z.array(MonitoringPlanSchema).optional(),
});

export type TreatmentDetail = z.infer<typeof TreatmentDetailSchema>;

// ============================================
// Input/Upsert Schemas for Treatment Extensions
// ============================================

// Informed Consent Input Schemas
export const CreateInformedConsentSchema = z.object({
  treatmentId: z.coerce.number(),
  pdfUri: z.string().nullable().optional(),
  signatureDate: z.string().nullable().optional(),
  uploadedByUserId: z.coerce.number().nullable().optional(),
});

export const UpdateInformedConsentSchema =
  CreateInformedConsentSchema.partial().extend({
    id: z.coerce.number(),
  });

export type CreateInformedConsentInput = z.infer<
  typeof CreateInformedConsentSchema
>;
export type UpdateInformedConsentInput = z.infer<
  typeof UpdateInformedConsentSchema
>;

// Post Transfer Milestone Input Schemas
export const CreatePostTransferMilestoneSchema = z.object({
  treatmentId: z.number(),
  milestoneType: z.nativeEnum(MilestoneType),
  result: z.string().max(20).nullable().optional(),
  milestoneDate: z.string().nullable().optional(),
  registeredByDoctorId: z.number().nullable().optional(),
});

export const UpdatePostTransferMilestoneSchema =
  CreatePostTransferMilestoneSchema.partial().extend({
    id: z.number(),
  });

export type CreatePostTransferMilestoneInput = z.infer<
  typeof CreatePostTransferMilestoneSchema
>;
export type UpdatePostTransferMilestoneInput = z.infer<
  typeof UpdatePostTransferMilestoneSchema
>;

// Medical Coverage Input Schemas
export const CreateMedicalCoverageSchema = z.object({
  medicalInsuranceId: z.number(),
  treatmentId: z.number(),
  coveragePercentage: z.number().nullable().optional(),
  patientDue: z.number().nullable().optional(),
  insuranceDue: z.number().nullable().optional(),
});

export const UpdateMedicalCoverageSchema =
  CreateMedicalCoverageSchema.partial().extend({
    id: z.number(),
  });

export type CreateMedicalCoverageInput = z.infer<
  typeof CreateMedicalCoverageSchema
>;
export type UpdateMedicalCoverageInput = z.infer<
  typeof UpdateMedicalCoverageSchema
>;

// Doctor Note Input Schemas
export const CreateDoctorNoteSchema = z.object({
  treatmentId: z.number(),
  noteDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().min(1, "La nota es requerida"),
});

export const UpdateDoctorNoteSchema = CreateDoctorNoteSchema.partial().extend({
  id: z.number(),
});

export type CreateDoctorNoteInput = z.infer<typeof CreateDoctorNoteSchema>;
export type UpdateDoctorNoteInput = z.infer<typeof UpdateDoctorNoteSchema>;

// Medication Protocol Input Schemas
export const CreateMedicationProtocolSchema = z.object({
  treatmentId: z.number(),
  protocolType: z.string().min(1, "El tipo de protocolo es requerido"),
  drugName: z.string().min(1, "El medicamento principal es requerido"),
  dose: z.string(),
  administrationRoute: z.string(),
  duration: z.string().nullable().optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  additionalMedication: z.array(z.string()).nullable().optional(),
});

export const UpdateMedicationProtocolSchema =
  CreateMedicationProtocolSchema.partial().extend({
    id: z.number(),
  });

export type CreateMedicationProtocolInput = z.infer<
  typeof CreateMedicationProtocolSchema
>;
export type UpdateMedicationProtocolInput = z.infer<
  typeof UpdateMedicationProtocolSchema
>;

// Monitoring Input Schemas
export const CreateMonitoringSchema = z.object({
  monitoringDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dayNumber: z.coerce.number().nullable().optional(),
  follicleCount: z.coerce.number().nullable().optional(),
  follicleSize: z.string().nullable().optional(),
  estradiolLevel: z.coerce.number().nullable().optional(),
  observations: z.string().nullable().optional(),
  monitoringPlanId: z.coerce.number().nullable().optional(),
});

export const UpdateMonitoringSchema = CreateMonitoringSchema.partial().extend({
  id: z.number(),
});

export type CreateMonitoringInput = z.infer<typeof CreateMonitoringSchema>;
export type UpdateMonitoringInput = z.infer<typeof UpdateMonitoringSchema>;

// Treatment Update Schema
export const UpdateTreatmentSchema = z.object({
  id: z.number(),
  initialObjective: InitialObjectiveEnum.optional(),
  startDate: z.string().nullable().optional(),
  status: TreatmentStatusEnum.optional(),
  closureReason: z.string().nullable().optional(),
  closureDate: z.string().nullable().optional(),
});

export type UpdateTreatmentInput = z.infer<typeof UpdateTreatmentSchema>;
