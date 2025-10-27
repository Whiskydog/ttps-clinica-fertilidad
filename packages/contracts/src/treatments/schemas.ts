import { z } from "zod";
import { InitialObjective, TreatmentStatus } from "./enums";

export const InitialObjectiveEnum = z.enum(InitialObjective);

export const TreatmentStatusEnum = z.enum(TreatmentStatus);

export const CreateTreatmentSchema = z.object({
  initial_objective: InitialObjectiveEnum,
});

export type CreateTreatmentDtoType = z.infer<typeof CreateTreatmentSchema>;
