import { PatientCreateSchema } from "../users/schemas";
import * as z from "zod";

export const PatientSignUpSchema = PatientCreateSchema.extend({
  confirmPassword: PatientCreateSchema.shape.password,
});

export type PatientSignUp = z.infer<typeof PatientSignUpSchema>;
