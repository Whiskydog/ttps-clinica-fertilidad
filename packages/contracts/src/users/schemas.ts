import { z } from "zod";
import { BiologicalSex } from "./enums";

export const PatientCreateSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.email(),
  phone: z.string().min(7).max(15),
  password: z.string().min(6).max(100),
  dni: z.string().min(5).max(20),
  dateOfBirth: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    })
    .transform((date) => new Date(date)),
  occupation: z.string().min(1).max(100),
  biologicalSex: z.enum(BiologicalSex),
  // Optional obra social relation on create (camelCase only)
  medicalInsuranceId: z.number().int().positive().optional(),
  coverageMemberId: z.string().max(100).optional(),
});

export const PatientUpdateSchema = PatientCreateSchema.partial();

export const PatientResponseSchema = z.object({
  id: z.int().positive(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.email(),
  phone: z.string().min(7).max(15),
  dni: z.string().min(5).max(20),
  dateOfBirth: z.date(),
  occupation: z.string().min(1).max(100),
  biologicalSex: z.enum(BiologicalSex),
  medicalInsuranceId: z.int().positive().nullable().optional(),
  coverageMemberId: z.string().max(100).nullable().optional(),
});

export const PatientsListResponseSchema = z.array(PatientResponseSchema);
