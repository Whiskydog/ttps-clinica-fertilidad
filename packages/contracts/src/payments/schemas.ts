import { z } from "zod";
import { ApiResponseSchema } from "../common/api";

export const PatientDebtSchema = z.object({
  debt: z.number().nonnegative(),
});

export type PatientDebt = z.infer<typeof PatientDebtSchema>;

export const PatientDebtResponseSchema = ApiResponseSchema(PatientDebtSchema);

export type PatientDebtResponse = z.infer<typeof PatientDebtResponseSchema>;

export type ExternalPatientDebtResponse = {
  id_paciente: number;
  numero_grupo: number;
  deuda_total: number;
};
