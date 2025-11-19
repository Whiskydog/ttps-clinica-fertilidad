import { z } from "zod";
import { CycleRegularity, BackgroundType } from "./enums";
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

// ============================================
// New Schemas for Medical History Extensions
// ============================================

// Habits Schema
export const HabitsSchema = z.object({
  id: z.number(),
  medicalHistoryId: z.number(),
  cigarettesPerDay: z.number().int().nullable(),
  yearsSmoking: z.number().int().nullable(),
  packDaysValue: z.number().nullable(), // decimal 6,2
  alcoholConsumption: z.string().nullable(),
  recreationalDrugs: z.string().max(255).nullable(),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
});

export type Habits = z.infer<typeof HabitsSchema>;

// Fenotype Schema
export const FenotypeSchema = z.object({
  id: z.number(),
  medicalHistoryId: z.number(),
  partnerDataId: z.number().nullable(), // NULL = patient, value = partner
  eyeColor: z.string().max(50).nullable(),
  hairColor: z.string().max(50).nullable(),
  hairType: z.string().max(50).nullable(),
  height: z.number().nullable(), // decimal 5,2
  complexion: z.string().max(20).nullable(),
  ethnicity: z.string().max(100).nullable(),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
});

export type Fenotype = z.infer<typeof FenotypeSchema>;

// Background Schema
export const BackgroundSchema = z.object({
  id: z.number(),
  medicalHistoryId: z.number(),
  termCode: z.string().max(50).nullable(),
  backgroundType: z.nativeEnum(BackgroundType),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
});

export type Background = z.infer<typeof BackgroundSchema>;

// ============================================
// Input/Upsert Schemas for new entities
// ============================================

// Habits Input Schema
export const CreateHabitsSchema = z.object({
  medicalHistoryId: z.number(),
  cigarettesPerDay: z.number().int().nullable().optional(),
  yearsSmoking: z.number().int().nullable().optional(),
  packDaysValue: z.number().nullable().optional(),
  alcoholConsumption: z.string().nullable().optional(),
  recreationalDrugs: z.string().max(255).nullable().optional(),
});

export const UpdateHabitsSchema = CreateHabitsSchema.partial().extend({
  id: z.number(),
});

export type CreateHabitsInput = z.infer<typeof CreateHabitsSchema>;
export type UpdateHabitsInput = z.infer<typeof UpdateHabitsSchema>;

// Fenotype Input Schema
export const CreateFenotypeSchema = z.object({
  medicalHistoryId: z.number(),
  partnerDataId: z.number().nullable().optional(),
  eyeColor: z.string().max(50).nullable().optional(),
  hairColor: z.string().max(50).nullable().optional(),
  hairType: z.string().max(50).nullable().optional(),
  height: z.number().nullable().optional(),
  complexion: z.string().max(20).nullable().optional(),
  ethnicity: z.string().max(100).nullable().optional(),
});

export const UpdateFenotypeSchema = CreateFenotypeSchema.partial().extend({
  id: z.number(),
});

export type CreateFenotypeInput = z.infer<typeof CreateFenotypeSchema>;
export type UpdateFenotypeInput = z.infer<typeof UpdateFenotypeSchema>;

// Background Input Schema
export const CreateBackgroundSchema = z.object({
  medicalHistoryId: z.number(),
  termCode: z.string().max(50).nullable().optional(),
  backgroundType: z.nativeEnum(BackgroundType),
});

export const UpdateBackgroundSchema = CreateBackgroundSchema.partial().extend({
  id: z.number(),
});

export type CreateBackgroundInput = z.infer<typeof CreateBackgroundSchema>;
export type UpdateBackgroundInput = z.infer<typeof UpdateBackgroundSchema>;

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
  habits: z.array(HabitsSchema).optional(),
  fenotypes: z.array(FenotypeSchema).optional(),
  backgrounds: z.array(BackgroundSchema).optional(),
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
