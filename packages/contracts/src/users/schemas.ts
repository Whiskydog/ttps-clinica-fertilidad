import moment from "moment";
import * as z from "zod";
import { ApiResponseSchema } from "../common/api";
import { MedicalInsuranceSchema } from "../medical-insurances/schemas";
import { BiologicalSex, RoleCode } from "./enums";

export const UserEntitySchema = z.object({
  id: z.int().positive(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.email(),
  phone: z.string().min(7).max(15),
  role: z.object({
    code: z.enum(RoleCode),
    name: z.string(),
  }),
});

export const UserResponseSchema = ApiResponseSchema(UserEntitySchema);

export type UserResponse = z.infer<typeof UserResponseSchema>;

export const PatientCreateSchema = z.object({
  firstName: z
    .string({ error: "Nombre es requerido" })
    .min(1, { error: "Nombre es obligatorio" })
    .min(2, { error: "Nombre muy corto" })
    .max(100, { error: "Nombre muy largo" })
    .trim(),
  lastName: z
    .string({ error: "Apellido es requerido" })
    .min(1, { error: "Apellido es obligatorio" })
    .min(2, { error: "Apellido muy corto" })
    .max(100, { error: "Apellido muy largo" })
    .trim(),
  email: z.email({ error: "Email inválido" }),
  phone: z
    .string({ error: "Teléfono es requerido" })
    .min(1, { error: "Teléfono es obligatorio" })
    .min(7, { error: "Teléfono muy corto" })
    .max(15, { error: "Teléfono muy largo" }),
  address: z.string().max(100, { error: "Dirección muy larga" }).optional(),
  password: z
    .string({ error: "Contraseña es requerida" })
    .min(6, { error: "Contraseña muy corta" })
    .max(100, { error: "Contraseña muy larga" }),
  dni: z
    .string({ error: "DNI es requerido" })
    .min(1, { error: "DNI es obligatorio" })
    .min(5, { error: "DNI muy corto" })
    .max(20, { error: "DNI muy largo" }),
  dateOfBirth: z.iso.date({ error: "Fecha de nacimiento inválida" }),
  medicalInsuranceName: z
    .string({ error: "Obra social es requerida" })
    .min(1, { error: "Obra social es obligatoria" })
    .max(100, { error: "Obra social muy larga" })
    .optional(),
  insuranceNumber: z
    .string({ error: "Número de afiliado es requerido" })
    .min(1, { error: "Número de afiliado es obligatorio" })
    .min(5, { error: "Número de afiliado muy corto" })
    .max(50, { error: "Número de afiliado muy largo" })
    .optional(),
  occupation: z.string().max(100, { error: "Ocupación muy larga" }).optional(),
  biologicalSex: z.enum(BiologicalSex, {
    error: "Sexo biológico es requerido",
  }),
});

export const PatientUpdateSchema = PatientCreateSchema.partial();

const PatientEntitySchema = UserEntitySchema.safeExtend({
  address: z
    .string()
    .max(100)
    .nullable()
    .transform((val) => val ?? undefined),
  dni: z.string().min(5).max(20),
  dateOfBirth: z.date(),
  occupation: z
    .string()
    .min(1)
    .max(100)
    .nullable()
    .transform((val) => val ?? undefined),
  biologicalSex: z.enum(BiologicalSex),
  medicalInsurance: MedicalInsuranceSchema.nullable(),
  coverageMemberId: z
    .string()
    .min(5)
    .max(100)
    .nullable()
    .transform((val) => val ?? undefined),
});

const PatientSchema = PatientEntitySchema.transform(
  ({ dateOfBirth, medicalInsurance, coverageMemberId, ...rest }) => ({
    ...rest,
    dateOfBirth: moment(dateOfBirth).format("YYYY-MM-DD"),
    medicalInsuranceName: medicalInsurance?.name,
    insuranceNumber: coverageMemberId,
  })
);

export const PatientResponseSchema = ApiResponseSchema(PatientSchema);

export type PatientResponse = z.infer<typeof PatientResponseSchema>;

export const PatientsListResponseSchema = ApiResponseSchema(
  z.array(PatientSchema)
);

export type PatientsListResponse = z.infer<typeof PatientsListResponseSchema>;
