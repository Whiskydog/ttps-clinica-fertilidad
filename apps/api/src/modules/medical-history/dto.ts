import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { CreateMedicalHistorySchema } from '@repo/contracts';

export class CreateMedicalHistoryDto extends createZodDto(
  CreateMedicalHistorySchema,
) {}

export type CreateMedicalHistoryDtoType = z.infer<
  typeof CreateMedicalHistorySchema
>;
