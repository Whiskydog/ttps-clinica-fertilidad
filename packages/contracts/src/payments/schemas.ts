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

export type ExternalMedicalInsuranceDetail = {
  id: number;
  nombre: string;
  sigla: string;
};

export type ExternalMedicalInsuranceResponse = {
  data: ExternalMedicalInsuranceDetail[];
};

export type ExternalPaymentOrder = {
  id: number;
  id_obra: number;
  id_paciente: number;
  monto_total: number;
  monto_obra_social: number;
  monto_paciente: number;
};

export type ExternalPaymentOrderResponse = {
  success: boolean;
  pago: ExternalPaymentOrder;
};
