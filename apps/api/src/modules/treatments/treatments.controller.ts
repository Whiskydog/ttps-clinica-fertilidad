import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { TreatmentService } from './treatment.service';
import { CreateTreatmentDto } from './dto';
import { MedicalHistoryService } from '../medical-history/medical-history.service';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { RolesGuard } from '@auth/guards/role-auth.guard';
import { RequireRoles } from '@auth/decorators/require-roles.decorator';
import { RoleCode } from '@repo/contracts';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { User } from '@users/entities/user.entity';

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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async create(
    @Param('medicalHistoryId') medicalHistoryId: string,
    @Body() dto: CreateTreatmentDto,
    @CurrentUser() user: User,
  ) {
    const id = Number(medicalHistoryId);
    const medicalHistory = await this.medicalHistoryService.findById(id);
    if (!medicalHistory) {
      throw new NotFoundException('Historia clínica no encontrada');
    }
    return this.treatmentService.createTreatment(medicalHistory, dto, user.id);
  }
}
