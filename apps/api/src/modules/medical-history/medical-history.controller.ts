import { Controller, Post, Body } from '@nestjs/common';
import { MedicalHistoryService } from './medical-history.service';
import { CreateMedicalHistoryDto } from './dto/create-medical-history.dto';

@Controller('medical-history')
export class MedicalHistoryController {
  constructor(private readonly medicalHistoryService: MedicalHistoryService) {}

  @Post()
  async create(@Body() dto: CreateMedicalHistoryDto) {
    return this.medicalHistoryService.createForPatient(dto.patient_id);
  }
}
