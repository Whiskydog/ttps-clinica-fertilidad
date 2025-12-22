import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
  CreateTreatmentSchema,
  UpdateTreatmentSchema,
  CreateInformedConsentSchema,
  UpdateInformedConsentSchema,
  CreatePostTransferMilestoneSchema,
  UpdatePostTransferMilestoneSchema,
  CreateMedicalCoverageSchema,
  UpdateMedicalCoverageSchema,
  CreateDoctorNoteSchema,
  UpdateDoctorNoteSchema,
  CreateMedicationProtocolSchema,
  UpdateMedicationProtocolSchema,
  CreateTreatmentResponseSchema,
  CreateMonitoringPlanSchema,
  UpdateMonitoringPlanSchema,
} from '@repo/contracts';

export class CreateTreatmentDto extends createZodDto(CreateTreatmentSchema) {}
export class CreateTreatmentResponseDto extends createZodDto(
  CreateTreatmentResponseSchema,
) {}
export class UpdateTreatmentDto extends createZodDto(UpdateTreatmentSchema) {}

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

// Manual DTOs for DoctorNote to avoid validation conflicts
export class CreateDoctorNoteDto extends createZodDto(CreateDoctorNoteSchema) {}
export class UpdateDoctorNoteDto extends createZodDto(UpdateDoctorNoteSchema) {}

// DTO for MedicationProtocol
export class CreateMedicationProtocolDto extends createZodDto(
  CreateMedicationProtocolSchema,
) {}
export class UpdateMedicationProtocolDto extends createZodDto(
  UpdateMedicationProtocolSchema,
) {}
// DTO for MonitoringPlan
export class CreateMonitoringPlanDto extends createZodDto(
  CreateMonitoringPlanSchema,
) {}

export class UpdateMonitoringPlanDto extends createZodDto(
  UpdateMonitoringPlanSchema,
) {}