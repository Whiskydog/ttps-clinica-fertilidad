import { createZodDto } from 'nestjs-zod';
import {
  CreatePunctureRecordSchema,
  UpdatePunctureRecordSchema,
  CreateOocyteSchema,
  UpdateOocyteSchema,
  CreateOocyteStateHistorySchema,
  UpdateOocyteStateHistorySchema,
  CreateEmbryoSchema,
  UpdateEmbryoSchema,
} from '@repo/contracts';

// ============================================
// Puncture Record DTOs
// ============================================

export class CreatePunctureRecordDto extends createZodDto(
  CreatePunctureRecordSchema,
) {}

export class UpdatePunctureRecordDto extends createZodDto(
  UpdatePunctureRecordSchema,
) {}

// ============================================
// Oocyte DTOs
// ============================================

export class CreateOocyteDto extends createZodDto(CreateOocyteSchema) {}

export class UpdateOocyteDto extends createZodDto(UpdateOocyteSchema) {}

// ============================================
// Oocyte State History DTOs
// ============================================

export class CreateOocyteStateHistoryDto extends createZodDto(
  CreateOocyteStateHistorySchema,
) {}

export class UpdateOocyteStateHistoryDto extends createZodDto(
  UpdateOocyteStateHistorySchema,
) {}

// ============================================
// Embryo DTOs
// ============================================

export class CreateEmbryoDto extends createZodDto(CreateEmbryoSchema) {}

export class UpdateEmbryoDto extends createZodDto(UpdateEmbryoSchema) {}
