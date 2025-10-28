import * as z from "zod";
import { ApiResponseSchema } from "../common/api";
import { BiologicalSex } from "./enums";

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
    .max(100, { error: "Obra social muy larga" }),
  insuranceNumber: z
    .string({ error: "Número de afiliado es requerido" })
    .min(1, { error: "Número de afiliado es obligatorio" })
    .min(5, { error: "Número de afiliado muy corto" })
    .max(50, { error: "Número de afiliado muy largo" }),
  occupation: z.string().max(100, { error: "Ocupación muy larga" }).optional(),
  biologicalSex: z.enum(BiologicalSex, {
    error: "Sexo biológico es requerido",
  }),
});

export const PatientUpdateSchema = PatientCreateSchema.partial();

const PatientSchema = z.object({
  id: z.int().positive(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.email(),
  phone: z.string().min(7).max(15),
  dni: z.string().min(5).max(20),
  dateOfBirth: z.iso.date(),
  occupation: z.string().min(1).max(100),
  biologicalSex: z.enum(BiologicalSex),
  medicalInsuranceName: z.string().max(100).optional(),
  insuranceNumber: z.string().max(50).optional(),
});

export const PatientResponseSchema = ApiResponseSchema(PatientSchema);

export type PatientResponse = z.infer<typeof PatientResponseSchema>;

export const PatientsListResponseSchema = ApiResponseSchema(
  z.array(PatientSchema)
);
