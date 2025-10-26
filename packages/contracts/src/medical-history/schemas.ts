import { z } from "zod";

export const CreateMedicalHistorySchema = z.object({
  patient_id: z.number().int().positive(),
  physical_exam_notes: z.string().optional(),
  family_backgrounds: z.string().optional(),
});

export type CreateMedicalHistoryDtoType = z.infer<
  typeof CreateMedicalHistorySchema
>;
