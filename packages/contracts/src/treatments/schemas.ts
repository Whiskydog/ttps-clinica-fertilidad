import { z } from "zod";
import { InitialObjective, TreatmentStatus } from "./enums";

export const InitialObjectiveEnum = z.enum(InitialObjective);

export const TreatmentStatusEnum = z.enum(TreatmentStatus);

export const CreateTreatmentSchema = z.object({
  initial_objective: InitialObjectiveEnum,
});

export type CreateTreatmentDtoType = z.infer<typeof CreateTreatmentSchema>;

export const CreateTreatmentResponseSchema = z.object({
  id: z.number(),
  initialObjective: InitialObjectiveEnum,
  status: TreatmentStatusEnum,
  startDate: z.date(),
});

export type CreateTreatmentResponseDtoType = z.infer<
  typeof CreateTreatmentResponseSchema
>;
