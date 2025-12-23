import { z } from "zod";

// ============================================
// Study Type Fields Catalog
// ============================================

// Definición de campos estructurados por tipo de estudio
export const StudyTypeFieldsCatalog = {
  // Perfil Hormonal
  perfil_hormonal: {
    name: 'Perfil Hormonal',
    fields: [
      { key: 'FSH', label: 'FSH', unit: 'mUI/mL', type: 'number' as const },
      { key: 'LH', label: 'LH', unit: 'mUI/mL', type: 'number' as const },
      { key: 'estradiol', label: 'Estradiol', unit: 'pg/mL', type: 'number' as const },
      { key: 'progesterona', label: 'Progesterona', unit: 'ng/mL', type: 'number' as const },
      { key: 'prolactina', label: 'Prolactina', unit: 'ng/mL', type: 'number' as const },
      { key: 'AMH', label: 'AMH', unit: 'ng/mL', type: 'number' as const },
      { key: 'TSH', label: 'TSH', unit: 'mUI/L', type: 'number' as const },
      { key: 'T4_libre', label: 'T4 Libre', unit: 'ng/dL', type: 'number' as const },
    ],
  },

  // Hemograma
  hemograma: {
    name: 'Hemograma Completo',
    fields: [
      { key: 'hemoglobina', label: 'Hemoglobina', unit: 'g/dL', type: 'number' as const },
      { key: 'hematocrito', label: 'Hematocrito', unit: '%', type: 'number' as const },
      { key: 'globulos_rojos', label: 'Glóbulos Rojos', unit: 'millones/mm³', type: 'number' as const },
      { key: 'globulos_blancos', label: 'Glóbulos Blancos', unit: '/mm³', type: 'number' as const },
      { key: 'plaquetas', label: 'Plaquetas', unit: '/mm³', type: 'number' as const },
      { key: 'VCM', label: 'VCM', unit: 'fL', type: 'number' as const },
      { key: 'HCM', label: 'HCM', unit: 'pg', type: 'number' as const },
    ],
  },

  // Ecografía Transvaginal
  ecografia_transvaginal: {
    name: 'Ecografía Transvaginal',
    fields: [
      { key: 'endometrio_mm', label: 'Grosor Endometrio', unit: 'mm', type: 'number' as const },
      { key: 'patron_endometrial', label: 'Patrón Endometrial', unit: '', type: 'text' as const },
      { key: 'foliculos_ovario_der', label: 'Folículos Ovario Derecho', unit: '', type: 'number' as const },
      { key: 'foliculos_ovario_izq', label: 'Folículos Ovario Izquierdo', unit: '', type: 'number' as const },
      { key: 'diametro_foliculo_dominante', label: 'Diámetro Folículo Dominante', unit: 'mm', type: 'number' as const },
      { key: 'liquido_libre', label: 'Líquido Libre', unit: '', type: 'text' as const },
      { key: 'observaciones_eco', label: 'Observaciones', unit: '', type: 'text' as const },
    ],
  },

  // Espermograma
  espermograma: {
    name: 'Espermograma',
    fields: [
      { key: 'volumen', label: 'Volumen', unit: 'mL', type: 'number' as const },
      { key: 'concentracion', label: 'Concentración', unit: 'millones/mL', type: 'number' as const },
      { key: 'motilidad_progresiva', label: 'Motilidad Progresiva', unit: '%', type: 'number' as const },
      { key: 'motilidad_no_progresiva', label: 'Motilidad No Progresiva', unit: '%', type: 'number' as const },
      { key: 'inmoviles', label: 'Inmóviles', unit: '%', type: 'number' as const },
      { key: 'morfologia_normal', label: 'Morfología Normal', unit: '%', type: 'number' as const },
      { key: 'vitalidad', label: 'Vitalidad', unit: '%', type: 'number' as const },
      { key: 'pH', label: 'pH', unit: '', type: 'number' as const },
    ],
  },

  // Serología
  serologia: {
    name: 'Serología',
    fields: [
      { key: 'HIV', label: 'HIV', unit: '', type: 'text' as const },
      { key: 'hepatitis_B', label: 'Hepatitis B (HBsAg)', unit: '', type: 'text' as const },
      { key: 'hepatitis_C', label: 'Hepatitis C', unit: '', type: 'text' as const },
      { key: 'VDRL', label: 'VDRL', unit: '', type: 'text' as const },
      { key: 'toxoplasmosis_IgG', label: 'Toxoplasmosis IgG', unit: '', type: 'text' as const },
      { key: 'toxoplasmosis_IgM', label: 'Toxoplasmosis IgM', unit: '', type: 'text' as const },
      { key: 'rubeola_IgG', label: 'Rubéola IgG', unit: '', type: 'text' as const },
      { key: 'CMV_IgG', label: 'CMV IgG', unit: '', type: 'text' as const },
    ],
  },

  // Coagulograma
  coagulograma: {
    name: 'Coagulograma',
    fields: [
      { key: 'tiempo_protrombina', label: 'Tiempo de Protrombina', unit: 'seg', type: 'number' as const },
      { key: 'INR', label: 'INR', unit: '', type: 'number' as const },
      { key: 'KPTT', label: 'KPTT', unit: 'seg', type: 'number' as const },
      { key: 'fibrinogeno', label: 'Fibrinógeno', unit: 'mg/dL', type: 'number' as const },
    ],
  },

  // Genérico para otros estudios
  otro: {
    name: 'Otro Estudio',
    fields: [
      { key: 'resultado_general', label: 'Resultado', unit: '', type: 'text' as const },
      { key: 'observaciones', label: 'Observaciones', unit: '', type: 'text' as const },
    ],
  },
} as const;

export type StudyType = keyof typeof StudyTypeFieldsCatalog;

export const StudyTypeSchema = z.enum([
  'perfil_hormonal',
  'hemograma',
  'ecografia_transvaginal',
  'espermograma',
  'serologia',
  'coagulograma',
  'otro',
]);

// Schema para valores estructurados
export const StructuredValueSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.null()])
);

export type StructuredValue = z.infer<typeof StructuredValueSchema>;

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
  studyType: StudyTypeSchema.nullable().optional(), // Tipo de estudio para campos estructurados
  structuredValues: StructuredValueSchema.nullable().optional(), // Valores estructurados (JSON)
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
  studyType: StudyTypeSchema.nullable().optional(),
  structuredValues: StructuredValueSchema.nullable().optional(),
  transcription: z.string().nullable().optional(),
  originalPdfUri: z.string().nullable().optional(),
  transcribedByLabTechnicianId: z.number().nullable().optional(),
  transcriptionDate: z.string().nullable().optional(),
});

export const UpdateStudyResultSchema = CreateStudyResultSchema.partial().extend({
  id: z.number(),
});

export type CreateStudyResultInput = z.infer<typeof CreateStudyResultSchema>;
export type UpdateStudyResultInput = z.infer<typeof UpdateStudyResultSchema>;

// ============================================
// Input/Upsert Schemas for Medical Orders
// ============================================

export const CreateMedicalOrderSchema = z.object({
  patientId: z.number(),
  doctorId: z.number().nullable().optional(),
  treatmentId: z.number().nullable().optional(),
  category: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  studies: z.array(StudySchema).nullable().optional(),
  diagnosis: z.string().nullable().optional(),
  justification: z.string().nullable().optional(),
});

export const UpdateMedicalOrderSchema = CreateMedicalOrderSchema.partial().extend({
  id: z.number(),
  status: MedicalOrderStatusSchema.optional(),
  completedDate: z.string().nullable().optional(),
  results: z.string().nullable().optional(),
});

export type CreateMedicalOrderInput = z.infer<typeof CreateMedicalOrderSchema>;
export type UpdateMedicalOrderInput = z.infer<typeof UpdateMedicalOrderSchema>;

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
  pdfUrl: z.string().nullable().optional(),
  pdfGeneratedAt: z.string().nullable().optional(),
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
