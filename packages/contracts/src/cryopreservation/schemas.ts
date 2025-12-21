import { z } from "zod";
import { EmbryoSchema, OocyteSchema } from "../laboratory/schemas";

export const CryopreservedSemenSchema = z.object({
  id: z.number(),
  patientDni: z.string(),
  phenotype: z.object({
    height: z.number().optional(),
    ethnicity: z.string().optional(),
    eye_color: z.string().optional(),
    hair_type: z.string().optional(),
    complexion: z.string().optional(),
    hair_color: z.string().optional(),
  }).optional(),
  cryoTank: z.string().nullable(),
  cryoRack: z.string().nullable(),
  cryoTube: z.string().nullable(),
  isAvailable: z.boolean(),
  cryopreservationDate: z.string().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type CryopreservedSemen = z.infer<typeof CryopreservedSemenSchema>;

export const JourneyStepSchema = z.object({
  date: z.string(),
  time: z.string(),
  phase: z.string(),
  status: z.string(),
});

export type JourneyStep = z.infer<typeof JourneyStepSchema>;

// Resumen de criopreservación
export const CryopreservationSummarySchema = z.object({
    oocytes: z.array(OocyteSchema),
    embryos: z.array(EmbryoSchema),
    cryopreservedSemen: z.array(CryopreservedSemenSchema),
});

export type CryopreservationSummary = z.infer<
  typeof CryopreservationSummarySchema
>;
