import * as z from "zod";
import { BiologicalSex } from "./enums";

export const PatientCreateSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.email(),
  phone: z.string().min(7).max(15),
  address: z.string().min(5).max(200).optional(),
  password: z.string().min(6).max(100),
  dni: z.string().min(5).max(20),
  dateOfBirth: z.iso.date(),
  medicalInsurance: z.string().min(1).max(100),
  insuranceNumber: z.string().min(1).max(50),
  occupation: z.string().min(1).max(100),
  biologicalSex: z.enum(BiologicalSex),
});

export const PatientUpdateSchema = PatientCreateSchema.partial();

export const PatientResponseSchema = z.object({
  id: z.uuid(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.email(),
  phone: z.string().min(7).max(15),
  dni: z.string().min(5).max(20),
  dateOfBirth: z.date(),
  occupation: z.string().min(1).max(100),
  biologicalSex: z.enum(BiologicalSex),
});

export const PatientsListResponseSchema = z.array(PatientResponseSchema);
