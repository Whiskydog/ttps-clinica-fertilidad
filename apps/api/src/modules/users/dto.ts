import {
  PatientCreateSchema,
  PatientResponseSchema,
  PatientsListResponseSchema,
  PatientsQuerySchema,
  PatientsPaginatedResponseSchema,
  UserResponseSchema,
} from '@repo/contracts';
import { createZodDto } from 'nestjs-zod';

export class UserResponseDto extends createZodDto(UserResponseSchema) {}

export class PatientCreateDto extends createZodDto(PatientCreateSchema) {}
export class PatientResponseDto extends createZodDto(PatientResponseSchema) {}
export class PatientsListResponseDto extends createZodDto(
  PatientsListResponseSchema,
) {}
export class PatientsQueryDto extends createZodDto(PatientsQuerySchema) {}
export class PatientsPaginatedResponseDto extends createZodDto(
  PatientsPaginatedResponseSchema,
) {}
