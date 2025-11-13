import { z } from "zod";
import { CycleRegularity } from "./enums";
import { BiologicalSex } from "../users/enums";

export const PartnerDataSchema = z.object({
  id: z.number().optional(),
  firstName: z.string().max(100).optional().nullable(),
  lastName: z.string().max(100).optional().nullable(),
  dni: z.string().max(20).optional().nullable(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  occupation: z.string().max(100).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().max(255).optional().nullable(),
  biologicalSex: z.nativeEnum(BiologicalSex),
  genitalBackgrounds: z.string().optional().nullable(),
});

export const GynecologicalHistorySchema = z.object({
  id: z.number().optional(),
  // If partnerData is provided, this gynecological history applies to the partner (ROPA)
  partnerData: PartnerDataSchema.optional().nullable(),
  menarcheAge: z.number().int().optional().nullable(),
  cycleRegularity: z.enum(CycleRegularity).optional().nullable(),
  cycleDurationDays: z.number().int().optional().nullable(),
  bleedingCharacteristics: z.string().optional().nullable(),
  gestations: z.number().int().optional().nullable(),
  births: z.number().int().optional().nullable(),
  abortions: z.number().int().optional().nullable(),
  ectopicPregnancies: z.number().int().optional().nullable(),
});

export type GynecologicalHistory = z.infer<typeof GynecologicalHistorySchema>;

export const UpdateMedicalHistorySchema = z.object({
  id: z.number(),
  physicalExamNotes: z.string().optional().nullable(),
  familyBackgrounds: z.string().optional().nullable(),
  partnerData: PartnerDataSchema.optional().nullable(),
  gynecologicalHistory: GynecologicalHistorySchema.optional().nullable(),
});

export const UpsertPartnerPayloadSchema = z.object({
  medicalHistoryId: z.number(),
  partnerData: PartnerDataSchema,
  gynecologicalHistory: GynecologicalHistorySchema.optional(),
});

export type UpsertPartnerPayload = z.infer<typeof UpsertPartnerPayloadSchema>;

export type UpdateMedicalHistoryDtoType = z.infer<
  typeof UpdateMedicalHistorySchema
>;

export const MedicalHistoryResponseSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  patient: z
    .object({
      id: z.number(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      biologicalSex: z.string().optional(),
      email: z.string().optional(),
      dni: z.string().optional(),
      dateOfBirth: z.string().optional(),
      occupation: z.string().optional(),
    })
    .optional(),
  physicalExamNotes: z.string().optional().nullable(),
  familyBackgrounds: z.string().optional().nullable(),
  partnerData: PartnerDataSchema.optional().nullable(),
  gynecologicalHistory: z.array(GynecologicalHistorySchema).optional(),
});

export type MedicalHistoryResponse = z.infer<
  typeof MedicalHistoryResponseSchema
>;

export type PartnerData = {
  id?: number;
  firstName?: string | null;
  lastName?: string | null;
  dni?: string | null;
  birthDate?: string | null;
  occupation?: string | null;
  phone?: string | null;
  email?: string | null;
  biologicalSex: "male" | "female" | "intersex";
  genitalBackgrounds?: string | null;
};

export type GynecologicalFormData = {
  menarcheAge?: number | null;
  cycleRegularity?: string | null;
  cycleDurationDays?: number | null;
  bleedingCharacteristics?: string | null;
  gestations?: number | null;
  births?: number | null;
  abortions?: number | null;
  ectopicPregnancies?: number | null;
};

export type PartnerWithGynecology = PartnerData & GynecologicalFormData;

export interface MedicalDataState {
  physicalExamNotes: string;
  familyBackgrounds: string;
  partner: PartnerWithGynecology;
  patientGynecology: GynecologicalHistory;
}
