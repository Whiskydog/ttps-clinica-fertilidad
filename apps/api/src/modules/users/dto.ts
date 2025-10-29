import {
  PatientCreateSchema,
  PatientResponseSchema,
  PatientsListResponseSchema,
} from '@repo/contracts';
import { createZodDto } from 'nestjs-zod';

export class PatientCreateDto extends createZodDto(PatientCreateSchema) {}
export class PatientResponseDto extends createZodDto(PatientResponseSchema) {}
export class PatientsListResponseDto extends createZodDto(
  PatientsListResponseSchema,
) {}
