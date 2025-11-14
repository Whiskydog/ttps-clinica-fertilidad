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
  results: z.string().nullable(),
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
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type MedicalOrderDetail = z.infer<typeof MedicalOrderDetailSchema>;
