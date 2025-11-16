import { z } from "zod";

// ============================================
// Schemas para Cryopreservation
// ============================================

export const ProductTypeSchema = z.enum(["ovule", "embryo"]);

export type ProductType = z.infer<typeof ProductTypeSchema>;

export const JourneyStepSchema = z.object({
  date: z.string(),
  time: z.string(),
  phase: z.string(),
  status: z.string(),
});

export type JourneyStep = z.infer<typeof JourneyStepSchema>;

// Producto criopreservado básico (para listados)
export const CryopreservedProductSchema = z.object({
  id: z.number(),
  productId: z.string(),
  productType: ProductTypeSchema,
  status: z.string(),
  cryopreservationDate: z.string(),
  locationTank: z.string().nullable(),
  locationRack: z.string().nullable(),
  locationTube: z.string().nullable(),
  locationPosition: z.string().nullable(),
  patientId: z.number(),
  treatmentId: z.number(),
  // Campos específicos de embriones
  quality: z.string().nullable(),
  fertilizationDate: z.string().nullable(),
  pgtResult: z.string().nullable(),
  // Campos específicos de óvulos
  maturationState: z.string().nullable(),
  extractionDate: z.string().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type CryopreservedProduct = z.infer<typeof CryopreservedProductSchema>;

// Producto criopreservado con journey (para detalle)
export const CryopreservedProductDetailSchema = z.object({
  id: z.number(),
  productId: z.string(),
  productType: ProductTypeSchema,
  status: z.string(),
  cryopreservationDate: z.string(),
  locationTank: z.string().nullable(),
  locationRack: z.string().nullable(),
  locationTube: z.string().nullable(),
  locationPosition: z.string().nullable(),
  patientId: z.number(),
  treatmentId: z.number(),
  // Campos específicos de embriones
  quality: z.string().nullable(),
  fertilizationDate: z.string().nullable(),
  pgtResult: z.string().nullable(),
  journey: z.array(JourneyStepSchema).nullable(),
  // Campos específicos de óvulos
  maturationState: z.string().nullable(),
  extractionDate: z.string().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type CryopreservedProductDetail = z.infer<
  typeof CryopreservedProductDetailSchema
>;

// Resumen de criopreservación
export const CryopreservationSummarySchema = z.object({
  summary: z.object({
        ovules: z.object({
            total: z.number(),
            cryoDate: z.string(),
        }),
        embryos: z.object({
            total: z.number(),
            lastUpdate: z.string(),
        })
    }),
    ovules: z.array(CryopreservedProductSchema),
    embryos: z.array(CryopreservedProductSchema),
});

export type CryopreservationSummary = z.infer<
  typeof CryopreservationSummarySchema
>;
