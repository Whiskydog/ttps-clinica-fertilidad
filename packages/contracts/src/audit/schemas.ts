import { email, z } from "zod";

const AuditLogLightSchema = z.object({
  id: z.number(),
  tableName: z.string(),
  recordId: z.string(),
  modifiedField: z.string(),
  oldValue: z.any().nullable(),
  newValue: z.any().nullable(),
  modifiedByUser: z.object({
    id: z.number(),
    email: z.email(),
  }),
  modificationTimestamp: z.preprocess(
    (val) => (val instanceof Date ? val.toISOString() : val),
    z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid datetime" })
  ),
});

export const AuditLogsResponseSchema = z.array(AuditLogLightSchema);
