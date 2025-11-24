import { z } from "zod";
import { EmbryoSchema, OocyteSchema } from "../laboratory/schemas";

export const JourneyStepSchema = z.object({
  date: z.string(),
  time: z.string(),
  phase: z.string(),
  status: z.string(),
});

export type JourneyStep = z.infer<typeof JourneyStepSchema>;

// Resumen de criopreservación
export const CryopreservationSummarySchema = z.object({
    oocytes: z.array(OocyteSchema),
    embryos: z.array(EmbryoSchema),
});

export type CryopreservationSummary = z.infer<
  typeof CryopreservationSummarySchema
>;
