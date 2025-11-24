import { createZodDto } from 'nestjs-zod';
import {
  CreateMedicalOrderSchema,
  UpdateMedicalOrderSchema,
  CreateStudyResultSchema,
  UpdateStudyResultSchema,
} from '@repo/contracts';

// ============================================
// DTOs for Medical Orders
// ============================================

export class CreateMedicalOrderDto extends createZodDto(
  CreateMedicalOrderSchema,
) {}

export class UpdateMedicalOrderDto extends createZodDto(
  UpdateMedicalOrderSchema,
) {}

// ============================================
// DTOs for Study Results
// ============================================

export class CreateStudyResultDto extends createZodDto(
  CreateStudyResultSchema,
) {}

export class UpdateStudyResultDto extends createZodDto(
  UpdateStudyResultSchema,
) {}
