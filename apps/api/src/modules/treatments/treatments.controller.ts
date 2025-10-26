import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TreatmentService } from './treatment.service';
import { CreateTreatmentDto } from './dto';
import { MedicalHistoryService } from '../medical-history/medical-history.service';

@Controller('treatments')
export class TreatmentsController {
  constructor(
    private readonly treatmentService: TreatmentService,
    private readonly medicalHistoryService: MedicalHistoryService,
  ) {}

  @Get(':medicalHistoryId')
  async getByMedicalHistory(
    @Param('medicalHistoryId') medicalHistoryId: string,
  ) {
    const id = Number(medicalHistoryId);
    return this.treatmentService.findByMedicalHistoryId(id);
  }

  @Post(':medicalHistoryId')
  async create(
    @Param('medicalHistoryId') medicalHistoryId: string,
    @Body() dto: CreateTreatmentDto,
  ) {
    const id = Number(medicalHistoryId);
    const medicalHistory = await this.medicalHistoryService.findById(id);
    return this.treatmentService.createTreatment(medicalHistory, dto);
  }
}
