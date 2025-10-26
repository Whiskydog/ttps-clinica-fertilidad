import { z } from "zod";
import { InitialObjective, TreatmentStatus } from "./enums";

export const InitialObjectiveEnum = z.enum(InitialObjective);

export const TreatmentStatusEnum = z.enum(TreatmentStatus);

export const CreateTreatmentSchema = z
  .object({
    initial_objective: InitialObjectiveEnum,
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    initial_doctor_id: z.number().int().positive().optional(),
    status: TreatmentStatusEnum.default(TreatmentStatus.vigente),
    closure_reason: z.string().max(255).optional(),
    closure_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  })
  .refine((d) => d.status !== "closed" || !!d.closure_reason, {
    message: "closure_reason es obligatorio si status = closed",
    path: ["closure_reason"],
  });

export type CreateTreatmentDtoType = z.infer<typeof CreateTreatmentSchema>;
