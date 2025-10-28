import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { CreateTreatmentSchema } from '@repo/contracts';

export class CreateTreatmentDto extends createZodDto(CreateTreatmentSchema) {}

export type CreateTreatmentDtoType = z.infer<typeof CreateTreatmentSchema>;
