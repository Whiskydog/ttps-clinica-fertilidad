import { createZodDto } from 'nestjs-zod';
import {
  UpdateMedicalHistorySchema,
  PartnerDataSchema,
  GynecologicalHistorySchema,
} from '@repo/contracts';
import { z } from 'zod';

export class UpdateMedicalHistoryDto extends createZodDto(
  UpdateMedicalHistorySchema,
) {}

export type UpdateMedicalHistoryDtoType = ReturnType<
  typeof UpdateMedicalHistorySchema.parse
>;

const PartnerDataUpsertSchema = z.object({
  medicalHistoryId: z.number(),
  partnerData: PartnerDataSchema,
  // Si la pareja es mujer, el cliente puede (y debería) incluir
  // el historial ginecológico de esa pareja en el mismo payload.
  // Acá es opcional, pero el controlador lo exige cuando
  // el sexo biológico es femenino.
  gynecologicalHistory: GynecologicalHistorySchema.optional().nullable(),
});

export class PartnerDataUpsertDto extends createZodDto(
  PartnerDataUpsertSchema,
) {}

export type PartnerDataUpsertDtoType = ReturnType<
  typeof PartnerDataUpsertSchema.parse
>;

const GynecologicalUpsertSchema = z.object({
  medicalHistoryId: z.number(),
  gynecologicalHistory: GynecologicalHistorySchema,
});

export class GynecologicalUpsertDto extends createZodDto(
  GynecologicalUpsertSchema,
) {}

export type GynecologicalUpsertDtoType = ReturnType<
  typeof GynecologicalUpsertSchema.parse
>;
