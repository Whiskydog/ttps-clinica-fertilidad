import { PatientDebtResponseSchema } from '@repo/contracts';
import { createZodDto } from 'nestjs-zod';

export class PatientDebtResponseDto extends createZodDto(PatientDebtResponseSchema) {}
