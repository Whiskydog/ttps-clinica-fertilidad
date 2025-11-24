import { z } from "zod";
import {
  OocyteState,
  FertilizationTechnique,
  SemenSource,
  PgtResult,
  EmbryoDisposition,
} from "./enums";

// ============================================
// Schemas para Laboratory Module
// ============================================

// Puncture Record Schema
export const PunctureRecordSchema = z.object({
  id: z.number(),
  treatmentId: z.number(),
  punctureDateTime: z.string().nullable(),
  operatingRoomNumber: z.number().nullable(),
  observations: z.string().nullable(),
  labTechnicianId: z.number().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type PunctureRecord = z.infer<typeof PunctureRecordSchema>;

// Oocyte Schema
export const OocyteSchema = z.object({
  id: z.number(),
  uniqueIdentifier: z.string(), // ovo_AAAAMMDD_APENOM_NN_XXXXXXX
  punctureId: z.number(),
  currentState: z.nativeEnum(OocyteState),
  isCryopreserved: z.boolean(),
  cryoTank: z.string().nullable(),
  cryoRack: z.string().nullable(),
  cryoTube: z.string().nullable(),
  discardCause: z.string().nullable(),
  discardDateTime: z.string().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Oocyte = z.infer<typeof OocyteSchema>;

// Oocyte State History Schema
export const OocyteStateHistorySchema = z.object({
  id: z.number(),
  oocyteId: z.number(),
  previousState: z.nativeEnum(OocyteState).nullable(),
  newState: z.nativeEnum(OocyteState),
  transitionDate: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type OocyteStateHistory = z.infer<typeof OocyteStateHistorySchema>;

// Embryo Schema
export const EmbryoSchema = z.object({
  id: z.number(),
  uniqueIdentifier: z.string(), // emb_AAAAMMDD...
  oocyteOriginId: z.number(),
  fertilizationDate: z.string().nullable(),
  fertilizationTechnique: z.nativeEnum(FertilizationTechnique).nullable(),
  technicianId: z.number().nullable(),
  qualityScore: z.number().min(1).max(6).nullable(), // 1-6
  semenSource: z.nativeEnum(SemenSource).nullable(),
  donationIdUsed: z.string().nullable(),
  pgtDecisionSuggested: z.string().nullable(),
  pgtResult: z.nativeEnum(PgtResult).nullable(),
  finalDisposition: z.nativeEnum(EmbryoDisposition).nullable(),
  cryoTank: z.string().nullable(),
  cryoRack: z.string().nullable(),
  cryoTube: z.string().nullable(),
  discardCause: z.string().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Embryo = z.infer<typeof EmbryoSchema>;

// Schemas con relaciones para detalles

export const PunctureRecordDetailSchema = PunctureRecordSchema.extend({
  treatment: z
    .object({
      id: z.number(),
      initialObjective: z.string(),
    })
    .optional(),
  labTechnician: z
    .object({
      id: z.number(),
      firstName: z.string(),
      lastName: z.string(),
    })
    .nullable()
    .optional(),
});

export type PunctureRecordDetail = z.infer<typeof PunctureRecordDetailSchema>;

export const OocyteDetailSchema = OocyteSchema.extend({
  puncture: PunctureRecordSchema.optional(),
  stateHistory: z.array(OocyteStateHistorySchema).optional(),
});

export type OocyteDetail = z.infer<typeof OocyteDetailSchema>;

export const EmbryoDetailSchema = EmbryoSchema.extend({
  oocyteOrigin: OocyteSchema.optional(),
  technician: z
    .object({
      id: z.number(),
      firstName: z.string(),
      lastName: z.string(),
    })
    .nullable()
    .optional(),
});

export type EmbryoDetail = z.infer<typeof EmbryoDetailSchema>;

// ============================================
// Input/Upsert Schemas for Laboratory
// ============================================

// Puncture Record Input Schemas
export const CreatePunctureRecordSchema = z.object({
  treatmentId: z.number(),
  punctureDate: z.iso.datetime(),
  operatingRoomNumber: z.number().int().nullable().optional(),
  totalOocytesRetrieved: z.number().int().nullable().optional(),
  labTechnicianId: z.number().nullable().optional(),
  observations: z.string().nullable().optional(),
});

export const UpdatePunctureRecordSchema =
  CreatePunctureRecordSchema.partial().extend({
    id: z.number(),
  });

export type CreatePunctureRecordInput = z.infer<
  typeof CreatePunctureRecordSchema
>;
export type UpdatePunctureRecordInput = z.infer<
  typeof UpdatePunctureRecordSchema
>;

// Oocyte Input Schemas
export const CreateOocyteSchema = z.object({
  punctureRecordId: z.coerce.number(),
  currentState: z.nativeEnum(OocyteState),
  cryopreservationDate: z.iso.datetime().nullable().optional(),
  tankNumber: z.string().max(50).nullable().optional(),
  canisterNumber: z.string().max(50).nullable().optional(),
  caneNumber: z.string().max(50).nullable().optional(),
  gobletNumber: z.string().max(50).nullable().optional(),
});

export const UpdateOocyteSchema = CreateOocyteSchema.partial().extend({
  id: z.number(),
});

export type CreateOocyteInput = z.infer<typeof CreateOocyteSchema>;
export type UpdateOocyteInput = z.infer<typeof UpdateOocyteSchema>;

// Oocyte State History Input Schemas
export const CreateOocyteStateHistorySchema = z.object({
  oocyteId: z.number(),
  previousState: z.nativeEnum(OocyteState).nullable().optional(),
  newState: z.nativeEnum(OocyteState),
  changeDate: z.iso.datetime(),
});

export const UpdateOocyteStateHistorySchema =
  CreateOocyteStateHistorySchema.partial().extend({
    id: z.number(),
  });

export type CreateOocyteStateHistoryInput = z.infer<
  typeof CreateOocyteStateHistorySchema
>;
export type UpdateOocyteStateHistoryInput = z.infer<
  typeof UpdateOocyteStateHistorySchema
>;

// Embryo Input Schemas
export const CreateEmbryoSchema = z.object({
  oocyteOriginId: z.number(),
  uniqueIdentifier: z.string().max(50),
  fertilizationTechnique: z
    .nativeEnum(FertilizationTechnique)
    .nullable()
    .optional(),
  qualityScore: z.number().int().min(1).max(6).nullable().optional(),
  semenSource: z.nativeEnum(SemenSource).nullable().optional(),
  pgtResult: z.nativeEnum(PgtResult).nullable().optional(),
  finalDisposition: z.nativeEnum(EmbryoDisposition).nullable().optional(),
  cryopreservationDate: z.iso.datetime().nullable().optional(),
  tankNumber: z.string().max(50).nullable().optional(),
  canisterNumber: z.string().max(50).nullable().optional(),
  caneNumber: z.string().max(50).nullable().optional(),
  gobletNumber: z.string().max(50).nullable().optional(),
  labTechnicianId: z.number().nullable().optional(),
});

export const UpdateEmbryoSchema = CreateEmbryoSchema.partial().extend({
  id: z.number(),
});

export type CreateEmbryoInput = z.infer<typeof CreateEmbryoSchema>;
export type UpdateEmbryoInput = z.infer<typeof UpdateEmbryoSchema>;
