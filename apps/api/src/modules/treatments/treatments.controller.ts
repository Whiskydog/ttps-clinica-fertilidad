import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  NotFoundException,
  Patch,
  Delete,
  Logger,
} from '@nestjs/common';
import { TreatmentService } from './treatment.service';
import { TreatmentsService } from './treatments.service';
import {
  CreateTreatmentDto,
  UpdateTreatmentDto,
  CreateInformedConsentDto,
  UpdateInformedConsentDto,
  CreatePostTransferMilestoneDto,
  UpdatePostTransferMilestoneDto,
  CreateMedicalCoverageDto,
  UpdateMedicalCoverageDto,
  CreateDoctorNoteDto,
  UpdateDoctorNoteDto,
  UpdateMedicationProtocolDto,
} from './dto';
import { InformedConsentService } from './services/informed-consent.service';
import { PostTransferMilestoneService } from './services/post-transfer-milestone.service';
import { MedicalCoverageService } from './services/medical-coverage.service';
import { DoctorNoteService } from './services/doctor-note.service';
import { MedicationProtocolService } from './services/medication-protocol.service';
import { MedicalHistoryService } from '../medical-history/services/medical-history.service';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { RolesGuard } from '@auth/guards/role-auth.guard';
import { RequireRoles } from '@auth/decorators/require-roles.decorator';
import { CreateTreatmentResponseSchema, RoleCode } from '@repo/contracts';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { User } from '@users/entities/user.entity';
import { parseDateFromString } from '@common/utils/date.utils';

@Controller('treatments')
@UseGuards(JwtAuthGuard)
export class TreatmentsController {
  constructor(
    private readonly treatmentService: TreatmentService,
    private readonly treatmentsService: TreatmentsService,
    private readonly medicalHistoryService: MedicalHistoryService,
    private readonly informedConsentService: InformedConsentService,
    private readonly milestoneService: PostTransferMilestoneService,
    private readonly coverageService: MedicalCoverageService,
    private readonly doctorNoteService: DoctorNoteService,
    private readonly medicationProtocolService: MedicationProtocolService,
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
    if (isNaN(treatmentId)) {
      throw new NotFoundException('Invalid treatment ID');
    }
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

  // ============================================
  // Informed Consent Endpoints
  // ============================================

  @Post('informed-consent')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async createInformedConsent(
    @Body() dto: CreateInformedConsentDto,
    @CurrentUser() user: User,
  ) {
    console.log('[DEBUG] createInformedConsent - DTO recibido:', JSON.stringify(dto));
    console.log('[DEBUG] createInformedConsent - pdfUri:', dto.pdfUri);

    const consent = await this.informedConsentService.create({
      treatment: { id: dto.treatmentId } as any,
      pdfUri: dto.pdfUri ?? null,
      signatureDate: parseDateFromString(dto.signatureDate),
      uploadedByUser: dto.uploadedByUserId
        ? ({ id: dto.uploadedByUserId } as any)
        : ({ id: user.id } as any),
    });

    console.log('[DEBUG] createInformedConsent - Consentimiento creado:', JSON.stringify(consent));

    return {
      message: 'Consentimiento informado creado correctamente',
      id: consent.id,
    };
  }

  @Patch('informed-consent/:id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async updateInformedConsent(
    @Param('id') id: string,
    @Body() dto: UpdateInformedConsentDto,
  ) {
    const consentId = Number(id);
    console.log('[DEBUG] updateInformedConsent - DTO recibido:', JSON.stringify(dto));
    console.log('[DEBUG] updateInformedConsent - pdfUri:', dto.pdfUri);
    console.log('[DEBUG] updateInformedConsent - "pdfUri" in dto:', 'pdfUri' in dto);

    // Preparar datos para actualización, manteniendo null si está presente
    const updateData: Partial<any> = {};

    if ('pdfUri' in dto) {
      updateData.pdfUri = dto.pdfUri;
      console.log('[DEBUG] updateInformedConsent - Actualizando pdfUri a:', dto.pdfUri);
    }
    if ('signatureDate' in dto) {
      updateData.signatureDate = parseDateFromString(dto.signatureDate);
    }

    console.log('[DEBUG] updateInformedConsent - updateData:', JSON.stringify(updateData));

    const updated = await this.informedConsentService.update(consentId, updateData);

    console.log('[DEBUG] updateInformedConsent - Consentimiento actualizado:', JSON.stringify(updated));

    return {
      message: 'Consentimiento informado actualizado correctamente',
      id: updated.id,
    };
  }

  @Delete('informed-consent/:id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async deleteInformedConsent(@Param('id') id: string) {
    const consentId = Number(id);
    await this.informedConsentService.remove(consentId);
    return {
      message: 'Consentimiento informado eliminado correctamente',
    };
  }

  // ============================================
  // Post Transfer Milestone Endpoints
  // ============================================

  @Post('milestone')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async createMilestone(
    @Body() dto: CreatePostTransferMilestoneDto,
    @CurrentUser() user: User,
  ) {
    const milestone = await this.milestoneService.create({
      treatment: { id: dto.treatmentId } as any,
      milestoneType: dto.milestoneType,
      result: dto.result ?? null,
      milestoneDate: parseDateFromString(dto.milestoneDate),
      registeredByDoctor: dto.registeredByDoctorId
        ? ({ id: dto.registeredByDoctorId } as any)
        : ({ id: user.id } as any),
    });
    return {
      message: 'Hito post-transferencia creado correctamente',
      id: milestone.id,
    };
  }

  @Patch('milestone/:id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async updateMilestone(
    @Param('id') id: string,
    @Body() dto: UpdatePostTransferMilestoneDto,
  ) {
    const milestoneId = Number(id);
    const updated = await this.milestoneService.update(milestoneId, {
      milestoneType: dto.milestoneType ?? undefined,
      result: dto.result ?? undefined,
      milestoneDate: parseDateFromString(dto.milestoneDate) ?? undefined,
    });
    return {
      message: 'Hito post-transferencia actualizado correctamente',
      id: updated.id,
    };
  }

  @Delete('milestone/:id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async deleteMilestone(@Param('id') id: string) {
    const milestoneId = Number(id);
    await this.milestoneService.remove(milestoneId);
    return {
      message: 'Hito post-transferencia eliminado correctamente',
    };
  }

  // ============================================
  // Medical Coverage Endpoints
  // ============================================

  @Post('coverage')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async createCoverage(@Body() dto: CreateMedicalCoverageDto) {
    const coverage = await this.coverageService.create({
      medicalInsurance: { id: dto.medicalInsuranceId } as any,
      treatment: { id: dto.treatmentId } as any,
      coveragePercentage: dto.coveragePercentage ?? null,
      patientDue: dto.patientDue ?? null,
      insuranceDue: dto.insuranceDue ?? null,
    });
    return {
      message: 'Cobertura médica creada correctamente',
      id: coverage.id,
    };
  }

  @Patch('coverage/:id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async updateCoverage(
    @Param('id') id: string,
    @Body() dto: UpdateMedicalCoverageDto,
  ) {
    const coverageId = Number(id);
    const updated = await this.coverageService.update(coverageId, {
      coveragePercentage: dto.coveragePercentage ?? undefined,
      patientDue: dto.patientDue ?? undefined,
      insuranceDue: dto.insuranceDue ?? undefined,
    });
    return {
      message: 'Cobertura médica actualizada correctamente',
      id: updated.id,
    };
  }

  @Delete('coverage/:id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async deleteCoverage(@Param('id') id: string) {
    const coverageId = Number(id);
    await this.coverageService.remove(coverageId);
    return {
      message: 'Cobertura médica eliminada correctamente',
    };
  }

  @Post('doctor-notes/create')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async createDoctorNote(
    @Body() dto: CreateDoctorNoteDto,
    @CurrentUser() user: User,
  ) {
    const note = await this.doctorNoteService.create({
      treatmentId: dto.treatmentId,
      noteDate: dto.noteDate,
      note: dto.note,
      doctorId: user.id,
    });

    return {
      message: 'Nota del doctor creada correctamente',
      id: note.id,
    };
  }

  @Patch('doctor-notes/:id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async updateDoctorNote(
    @Param('id') id: string,
    @Body() dto: UpdateDoctorNoteDto,
  ) {
    const noteId = Number(id);
    const updated = await this.doctorNoteService.update(noteId, {
      noteDate: dto.noteDate,
      note: dto.note,
    });
    return {
      message: 'Nota del doctor actualizada correctamente',
      id: updated.id,
    };
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async updateTreatment(
    @Param('id') id: string,
    @Body() dto: UpdateTreatmentDto,
  ) {
    const treatmentId = Number(id);
    const updated = await this.treatmentService.update(treatmentId, {
      ...dto,
      startDate: (dto.startDate) ?? undefined,
      closureDate: (dto.closureDate) ?? undefined,
    });
    return {
      message: 'Tratamiento actualizado correctamente',
      id: updated.id,
    };
  }

  @Delete('doctor-notes/:id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async deleteDoctorNote(@Param('id') id: string) {
    const noteId = Number(id);
    await this.doctorNoteService.remove(noteId);
    return {
      message: 'Nota del doctor eliminada correctamente',
    };
  }

  // ============================================
  // Medication Protocol Endpoints
  // ============================================

  @Patch('medication-protocols/:id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async updateMedicationProtocol(
    @Param('id') id: string,
    @Body() dto: UpdateMedicationProtocolDto,
  ) {
    const protocolId = Number(id);
    const updated = await this.medicationProtocolService.update(protocolId, {
      protocolType: dto.protocolType,
      drugName: dto.drugName,
      dose: dto.dose,
      administrationRoute: dto.administrationRoute,
      duration: dto.duration,
      startDate: dto.startDate ?? undefined,
      additionalMedication: dto.additionalMedication,
    });
    return {
      message: 'Protocolo de medicación actualizado correctamente',
      id: updated.id,
    };
  }
}
