import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MedicalHistoryService } from './medical-history.service';
import { CreateMedicalHistoryDto } from './dto/create-medical-history.dto';

@Controller('medical-history')
export class MedicalHistoryController {
  constructor(private readonly medicalHistoryService: MedicalHistoryService) {}

  @Get(':patientId')
  async getByPatient(@Param('patientId') patientId: number) {
    return this.medicalHistoryService.findByPatientId(patientId);
  }

  @Post()
  async create(@Body() dto: CreateMedicalHistoryDto) {
    return this.medicalHistoryService.createForPatient(dto.patient_id);
  }
}
