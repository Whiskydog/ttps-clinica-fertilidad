import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
  CreateTreatmentSchema,
  CreateInformedConsentSchema,
  UpdateInformedConsentSchema,
  CreatePostTransferMilestoneSchema,
  UpdatePostTransferMilestoneSchema,
  CreateMedicalCoverageSchema,
  UpdateMedicalCoverageSchema,
} from '@repo/contracts';

export class CreateTreatmentDto extends createZodDto(CreateTreatmentSchema) {}

export type CreateTreatmentDtoType = z.infer<typeof CreateTreatmentSchema>;

// ============================================
// DTOs for Treatment Extensions
// ============================================

export class CreateInformedConsentDto extends createZodDto(
  CreateInformedConsentSchema,
) {}
export class UpdateInformedConsentDto extends createZodDto(
  UpdateInformedConsentSchema,
) {}

export class CreatePostTransferMilestoneDto extends createZodDto(
  CreatePostTransferMilestoneSchema,
) {}
export class UpdatePostTransferMilestoneDto extends createZodDto(
  UpdatePostTransferMilestoneSchema,
) {}

export class CreateMedicalCoverageDto extends createZodDto(
  CreateMedicalCoverageSchema,
) {}
export class UpdateMedicalCoverageDto extends createZodDto(
  UpdateMedicalCoverageSchema,
) {}
