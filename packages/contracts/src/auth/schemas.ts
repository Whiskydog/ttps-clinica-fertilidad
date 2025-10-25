import { PatientCreateSchema } from "../users/schemas";

export const PatientSignUpSchema = PatientCreateSchema.extend({
  confirmPassword: PatientCreateSchema.shape.password,
});
