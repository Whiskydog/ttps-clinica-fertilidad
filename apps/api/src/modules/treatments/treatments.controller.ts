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
import { TreatmentsService } from './treatments.service';
import { CreateTreatmentDto } from './dto';
import { MedicalHistoryService } from '../medical-history/services/medical-history.service';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { RolesGuard } from '@auth/guards/role-auth.guard';
import { RequireRoles } from '@auth/decorators/require-roles.decorator';
import { CreateTreatmentResponseSchema, RoleCode } from '@repo/contracts';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { User } from '@users/entities/user.entity';

@Controller('treatments')
@UseGuards(JwtAuthGuard)
export class TreatmentsController {
  constructor(
    private readonly treatmentService: TreatmentService,
    private readonly treatmentsService: TreatmentsService,
    private readonly medicalHistoryService: MedicalHistoryService,
  ) {}

  // Endpoints para pacientes
  @Get('patient/current')
  @RequireRoles(RoleCode.PATIENT)
  async getCurrentTreatment(@CurrentUser() user: User) {
    return this.treatmentsService.getCurrentTreatmentByPatient(user.id);
  }

  @Get('patient/history')
  @RequireRoles(RoleCode.PATIENT)
  async getTreatmentHistory(@CurrentUser() user: User) {
    return this.treatmentsService.getTreatmentHistory(user.id);
  }

  @Get('detail/:id')
  @RequireRoles(RoleCode.PATIENT, RoleCode.DOCTOR)
  async getTreatmentDetail(@Param('id') id: string, @CurrentUser() user: User) {
    const treatmentId = Number(id);
    return this.treatmentsService.getTreatmentDetail(treatmentId, user.id);
  }

  // Endpoints existentes
  @Get(':medicalHistoryId')
  async getByMedicalHistory(
    @Param('medicalHistoryId') medicalHistoryId: string,
  ) {
    const id = Number(medicalHistoryId);
    return this.treatmentService.findByMedicalHistoryId(id);
  }

  @Post(':medicalHistoryId')
  @UseGuards(RolesGuard)
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
    const treatment = await this.treatmentService.createTreatment(
      medicalHistory,
      dto,
      user.id,
    );
    return CreateTreatmentResponseSchema.parse(treatment);
  }
}
