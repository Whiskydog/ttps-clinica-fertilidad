import * as z from "zod";
import { PatientCreateSchema } from "../users/schemas";

export const PatientSignUpSchema = PatientCreateSchema.extend({
  confirmPassword: PatientCreateSchema.shape.password,
});

export const PatientSignInSchema = z.object({
  dni: z.string().min(5).max(20),
  password: z.string({ error: "Contraseña es requerida" }),
});

export const StaffSignInSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(1, { message: "Contraseña es requerida" }),
});

export type PatientSignUp = z.infer<typeof PatientSignUpSchema>;

export type PatientSignIn = z.infer<typeof PatientSignInSchema>;

export type StaffSignIn = z.infer<typeof StaffSignInSchema>;
