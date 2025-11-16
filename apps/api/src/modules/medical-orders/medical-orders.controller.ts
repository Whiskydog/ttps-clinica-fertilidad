import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { MedicalOrdersService } from './medical-orders.service';
import { StudyResultService } from './services/study-result.service';
import { CreateStudyResultDto, UpdateStudyResultDto } from './dto';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { RolesGuard } from '@auth/guards/role-auth.guard';
import { RequireRoles } from '@auth/decorators/require-roles.decorator';
import { RoleCode } from '@repo/contracts';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { User } from '@users/entities/user.entity';
import type { MedicalOrderStatus } from './entities/medical-order.entity';

@Controller('medical-orders')
@UseGuards(JwtAuthGuard)
export class MedicalOrdersController {
  constructor(
    private readonly medicalOrdersService: MedicalOrdersService,
    private readonly studyResultService: StudyResultService,
  ) {}

  @Get('patient')
  @RequireRoles(RoleCode.PATIENT)
  async getPatientOrders(
    @CurrentUser() user: User,
    @Query('status') status?: MedicalOrderStatus,
  ) {
    return this.medicalOrdersService.findByPatient(user.id, status);
  }

  @Get('patient/:id')
  @RequireRoles(RoleCode.PATIENT)
  async getPatientOrderDetail(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    const orderId = Number(id);
    return this.medicalOrdersService.findOne(orderId, user.id);
  }

  // ============================================
  // Study Results Endpoints
  // ============================================

  @Post('study-results')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async createStudyResult(
    @Body() dto: CreateStudyResultDto,
    @CurrentUser() user: User,
  ) {
    const result = await this.studyResultService.create({
      medicalOrder: { id: dto.medicalOrderId } as any,
      studyName: dto.studyName ?? null,
      determinationName: dto.determinationName ?? null,
      transcription: dto.transcription ?? null,
      originalPdfUri: dto.originalPdfUri ?? null,
      transcribedByLabTechnician: dto.transcribedByLabTechnicianId
        ? ({ id: dto.transcribedByLabTechnicianId } as any)
        : ({ id: user.id } as any),
      transcriptionDate: dto.transcriptionDate
        ? new Date(dto.transcriptionDate)
        : null,
    });
    return {
      message: 'Resultado de estudio creado correctamente',
      id: result.id,
    };
  }

  @Patch('study-results/:id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async updateStudyResult(
    @Param('id') id: string,
    @Body() dto: UpdateStudyResultDto,
  ) {
    const resultId = Number(id);
    const updated = await this.studyResultService.update(resultId, {
      studyName: dto.studyName ?? undefined,
      determinationName: dto.determinationName ?? undefined,
      transcription: dto.transcription ?? undefined,
      originalPdfUri: dto.originalPdfUri ?? undefined,
      transcriptionDate: dto.transcriptionDate
        ? new Date(dto.transcriptionDate)
        : undefined,
    });
    return {
      message: 'Resultado de estudio actualizado correctamente',
      id: updated.id,
    };
  }

  @Delete('study-results/:id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async deleteStudyResult(@Param('id') id: string) {
    const resultId = Number(id);
    await this.studyResultService.remove(resultId);
    return {
      message: 'Resultado de estudio eliminado correctamente',
    };
  }

  @Get(':orderId/study-results')
  @RequireRoles(RoleCode.PATIENT, RoleCode.DOCTOR, RoleCode.LAB_TECHNICIAN)
  async getStudyResultsByOrder(@Param('orderId') orderId: string) {
    const orderIdNum = Number(orderId);
    return this.studyResultService.findByMedicalOrderId(orderIdNum);
  }
}
