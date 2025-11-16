import { z } from "zod";

// ============================================
// Schemas para Medical Orders
// ============================================

export const StudySchema = z.object({
  name: z.string(),
  checked: z.boolean(),
});

export type Study = z.infer<typeof StudySchema>;

export const MedicalOrderStatusSchema = z.enum(["pending", "completed"]);

export type MedicalOrderStatus = z.infer<typeof MedicalOrderStatusSchema>;

// Orden médica básica (para listados)
export const MedicalOrderSchema = z.object({
  id: z.number(),
  code: z.string(),
  issueDate: z.string(),
  status: MedicalOrderStatusSchema,
  category: z.string(),
  description: z.string().nullable(),
  studies: z.array(StudySchema).nullable(),
  diagnosis: z.string().nullable(),
  justification: z.string().nullable(),
  completedDate: z.string().nullable(),
  results: z.string().nullable(),
  patientId: z.number(),
  doctorId: z.number(),
  treatmentId: z.number().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type MedicalOrder = z.infer<typeof MedicalOrderSchema>;

// ============================================
// Study Results Schema
// ============================================

export const StudyResultSchema = z.object({
  id: z.number(),
  medicalOrderId: z.number(),
  studyName: z.string().max(255).nullable(),
  determinationName: z.string().max(255).nullable(), // FSH, LH, Estradiol, etc.
  transcription: z.string().nullable(),
  originalPdfUri: z.string().nullable(),
  transcribedByLabTechnicianId: z.number().nullable(),
  transcribedByLabTechnician: z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
  }).nullable().optional(),
  transcriptionDate: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
});

export type StudyResult = z.infer<typeof StudyResultSchema>;

// ============================================
// Input/Upsert Schemas for Study Results
// ============================================

export const CreateStudyResultSchema = z.object({
  medicalOrderId: z.number(),
  studyName: z.string().max(255).nullable().optional(),
  determinationName: z.string().max(255).nullable().optional(),
  transcription: z.string().nullable().optional(),
  originalPdfUri: z.string().nullable().optional(),
  transcribedByLabTechnicianId: z.number().nullable().optional(),
  transcriptionDate: z.iso.datetime().nullable().optional(),
});

export const UpdateStudyResultSchema = CreateStudyResultSchema.partial().extend({
  id: z.number(),
});

export type CreateStudyResultInput = z.infer<typeof CreateStudyResultSchema>;
export type UpdateStudyResultInput = z.infer<typeof UpdateStudyResultSchema>;

// Orden médica con relaciones (para detalle)
export const MedicalOrderDetailSchema = z.object({
  id: z.number(),
  code: z.string(),
  issueDate: z.string(),
  status: MedicalOrderStatusSchema,
  category: z.string(),
  description: z.string().nullable(),
  studies: z.array(StudySchema).nullable(),
  diagnosis: z.string().nullable(),
  justification: z.string().nullable(),
  completedDate: z.string().nullable(),
  results: z.string().nullable(), // Deprecated - use studyResults instead
  patient: z
    .object({
      id: z.number(),
      firstName: z.string(),
      lastName: z.string(),
      dni: z.string().optional(),
    })
    .optional(),
  doctor: z
    .object({
      id: z.number(),
      firstName: z.string(),
      lastName: z.string(),
    })
    .optional(),
  treatment: z
    .object({
      id: z.number(),
    })
    .nullable()
    .optional(),
  studyResults: z.array(StudyResultSchema).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type MedicalOrderDetail = z.infer<typeof MedicalOrderDetailSchema>;
