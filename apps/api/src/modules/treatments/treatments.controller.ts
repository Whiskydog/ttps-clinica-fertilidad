import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { TreatmentService } from './treatment.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { MedicalHistoryService } from '../medical-history/medical-history.service';

@Controller('treatments')
export class TreatmentsController {
  constructor(
    private readonly treatmentService: TreatmentService,
    private readonly medicalHistoryService: MedicalHistoryService,
  ) {}

  @Get(':medicalHistoryId')
  async getByMedicalHistory(
    @Param('medicalHistoryId', ParseIntPipe) medicalHistoryId: number,
  ) {
    return this.treatmentService.findByMedicalHistoryId(medicalHistoryId);
  }

  @Post(':medicalHistoryId')
  async create(
    @Param('medicalHistoryId', ParseIntPipe) medicalHistoryId: number,
    @Body() dto: CreateTreatmentDto,
  ) {
    const medicalHistory =
      await this.medicalHistoryService.findById(medicalHistoryId);
    return this.treatmentService.createTreatment(medicalHistory, dto);
  }
}
