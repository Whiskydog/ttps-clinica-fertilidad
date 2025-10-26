import { Controller, Post, Body } from '@nestjs/common';
import { MedicalHistoryService } from './medical-history.service';
import { CreateMedicalHistoryDto } from './dto';
import type { CreateMedicalHistoryDtoType } from './dto';

@Controller('medical-history')
export class MedicalHistoryController {
  constructor(private readonly medicalHistoryService: MedicalHistoryService) {}

  @Post()
  async create(
    @Body() dto: CreateMedicalHistoryDto & CreateMedicalHistoryDtoType,
  ) {
    return this.medicalHistoryService.createForPatient(Number(dto.patient_id));
  }
}
