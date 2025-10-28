import { z } from "zod";

export const MedicalInsuranceSchema = z.object({
  id: z.int().positive(),
  name: z.string().min(1).max(150),
});

export const MedicalInsurancesListSchema = z.array(MedicalInsuranceSchema);
