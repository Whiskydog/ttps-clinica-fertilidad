import { PatientCreateSchema, PatientResponseSchema } from '@repo/contracts';
import { createZodDto } from 'nestjs-zod';

export class PatientCreateDto extends createZodDto(PatientCreateSchema) {}
export class PatientResponseDto extends createZodDto(PatientResponseSchema) {}
