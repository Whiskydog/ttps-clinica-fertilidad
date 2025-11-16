import { createZodDto } from 'nestjs-zod';
import {
  CreateStudyResultSchema,
  UpdateStudyResultSchema,
} from '@repo/contracts';

// ============================================
// DTOs for Study Results
// ============================================

export class CreateStudyResultDto extends createZodDto(
  CreateStudyResultSchema,
) {}

export class UpdateStudyResultDto extends createZodDto(
  UpdateStudyResultSchema,
) {}
