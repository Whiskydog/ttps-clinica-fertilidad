import { z } from "zod";
import { InitialObjective, TreatmentStatus } from "./enums";
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

// Detalle completo de tratamiento
export const TreatmentDetailSchema = z.object({
  treatment: TreatmentSchema,
  monitorings: z.array(MonitoringSchema).optional(),
  protocol: MedicationProtocolSchema.nullable().optional(),
  doctorNotes: z.array(DoctorNoteSchema).optional(),
});

export type TreatmentDetail = z.infer<typeof TreatmentDetailSchema>;
