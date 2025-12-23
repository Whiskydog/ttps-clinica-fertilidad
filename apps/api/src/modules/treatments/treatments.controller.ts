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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  CreateMedicationProtocolDto,
  UpdateMedicationProtocolDto,
  CreateTreatmentResponseDto,
} from './dto';
import { InformedConsentService } from './services/informed-consent.service';
import { PostTransferMilestoneService } from './services/post-transfer-milestone.service';
import { MedicalCoverageService } from './services/medical-coverage.service';
import { DoctorNoteService } from './services/doctor-note.service';
import { MedicationProtocolService } from './services/medication-protocol.service';
import { MedicationPdfService } from './services/medication-pdf.service';
import { MedicalHistoryService } from '../medical-history/services/medical-history.service';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { RolesGuard } from '@auth/guards/role-auth.guard';
import { RequireRoles } from '@auth/decorators/require-roles.decorator';
import { RoleCode } from '@repo/contracts';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { User } from '@users/entities/user.entity';
import { parseDateFromString } from '@common/utils/date.utils';
import { ZodSerializerDto } from 'nestjs-zod';
import { EnvelopeMessage } from '@common/decorators/envelope-message.decorator';
import { CreateMonitoringDto } from './dto/create-monitoring.dto';
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
    private readonly medicationPdfService: MedicationPdfService,
  ) { }

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
  @RequireRoles(RoleCode.PATIENT, RoleCode.DOCTOR, RoleCode.DIRECTOR)
  async getTreatmentDetail(@Param('id') id: string, @CurrentUser() user: User) {
    const treatmentId = Number(id);
    if (isNaN(treatmentId)) {
      throw new NotFoundException('Invalid treatment ID');
    }
    return this.treatmentsService.getTreatmentDetail(
      treatmentId,
      user.id,
      user.role.code as RoleCode,
    );
  }

  // ============================================
  // Medication Protocol PDF Endpoints
  // (Deben ir ANTES de las rutas genéricas :medicalHistoryId)
  // ============================================

  @Post(':treatmentId/protocol/generate-pdf')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  @UseInterceptors(FileInterceptor('doctorSignature'))
  async generateProtocolPdf(
    @Param('treatmentId') treatmentId: string,
    @UploadedFile() doctorSignature: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    const id = Number(treatmentId);
    if (isNaN(id)) {
      throw new BadRequestException('ID de tratamiento inválido');
    }

    if (!doctorSignature) {
      throw new BadRequestException('La firma del médico es requerida');
    }

    // Validar que sea una imagen
    if (!doctorSignature.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        'El archivo debe ser una imagen (PNG, JPG)',
      );
    }

    // Validar tamaño máximo (500KB)
    const maxSize = 500 * 1024;
    if (doctorSignature.size > maxSize) {
      throw new BadRequestException('La firma no debe superar los 500KB');
    }

    const protocol = await this.medicationPdfService.generatePdf({
      treatmentId: id,
      doctorSignature,
      doctorId: user.id,
    });

    return {
      message: 'PDF de orden de medicación generado correctamente',
      pdfUrl: protocol.pdfUrl,
      generatedAt: protocol.pdfGeneratedAt,
    };
  }

  @Get(':treatmentId/protocol/pdf')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.PATIENT, RoleCode.DOCTOR)
  async getProtocolPdf(@Param('treatmentId') treatmentId: string) {
    const id = Number(treatmentId);
    if (isNaN(id)) {
      throw new BadRequestException('ID de tratamiento inválido');
    }

    const pdfUrl = await this.medicationPdfService.getProtocolPdf(id);

    if (!pdfUrl) {
      throw new NotFoundException('No se ha generado PDF para este protocolo');
    }

    return {
      pdfUrl,
    };
  }

  // ============================================
  // Informed Consent Endpoints
  // (Rutas específicas ANTES de rutas con parámetros)
  // ============================================

  @Post('informed-consent')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR, RoleCode.DIRECTOR)
  async createInformedConsent(
    @Body() dto: CreateInformedConsentDto,
    @CurrentUser() user: User,
  ) {
    const consent = await this.informedConsentService.create({
      treatment: { id: dto.treatmentId } as any,
      pdfUri: dto.pdfUri ?? null,
      signatureDate: parseDateFromString(dto.signatureDate),
      uploadedByUser: dto.uploadedByUserId
        ? ({ id: dto.uploadedByUserId } as any)
        : ({ id: user.id } as any),
    });

    return {
      message: 'Consentimiento informado creado correctamente',
      id: consent.id,
    };
  }

  @Patch('informed-consent/:id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR, RoleCode.DIRECTOR)
  async updateInformedConsent(
    @Param('id') id: string,
    @Body() dto: UpdateInformedConsentDto,
  ) {
    const consentId = Number(id);

    const updateData: Partial<any> = {};

    if ('pdfUri' in dto) {
      updateData.pdfUri = dto.pdfUri;
    }
    if ('signatureDate' in dto) {
      updateData.signatureDate = parseDateFromString(dto.signatureDate);
    }

    const updated = await this.informedConsentService.update(
      consentId,
      updateData,
    );

    return {
      message: 'Consentimiento informado actualizado correctamente',
      id: updated.id,
    };
  }

  @Delete('informed-consent/:id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR, RoleCode.DIRECTOR)
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
  @RequireRoles(RoleCode.DOCTOR, RoleCode.DIRECTOR)
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
  @RequireRoles(RoleCode.DOCTOR, RoleCode.DIRECTOR)
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
  @RequireRoles(RoleCode.DOCTOR, RoleCode.DIRECTOR)
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
  @RequireRoles(RoleCode.DOCTOR, RoleCode.DIRECTOR)
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
  @RequireRoles(RoleCode.DOCTOR, RoleCode.DIRECTOR)
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
  @RequireRoles(RoleCode.DOCTOR, RoleCode.DIRECTOR)
  async deleteCoverage(@Param('id') id: string) {
    const coverageId = Number(id);
    await this.coverageService.remove(coverageId);
    return {
      message: 'Cobertura médica eliminada correctamente',
    };
  }

  // ============================================
  // Doctor Notes Endpoints
  // ============================================

  @Post('doctor-notes/create')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR, RoleCode.DIRECTOR)
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
  @RequireRoles(RoleCode.DOCTOR, RoleCode.DIRECTOR)
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

  @Delete('doctor-notes/:id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR, RoleCode.DIRECTOR)
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

  @Post('medication-protocols')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR, RoleCode.DIRECTOR)
  async createMedicationProtocol(@Body() dto: CreateMedicationProtocolDto) {
    const protocol = await this.medicationProtocolService.create({
      treatmentId: dto.treatmentId,
      protocolType: dto.protocolType,
      drugName: dto.drugName,
      dose: dto.dose,
      administrationRoute: dto.administrationRoute,
      duration: dto.duration,
      startDate: dto.startDate,
      additionalMedication: dto.additionalMedication,
    });
    return {
      message: 'Protocolo de medicación creado correctamente',
      id: protocol.id,
    };
  }

  @Patch('medication-protocols/:id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR, RoleCode.DIRECTOR)
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

  // ============================================
  // Endpoints para crear un monitoreo
  // ============================================
  @Post(':id/monitorings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async createMonitoring(
    @Param('id', ParseIntPipe) treatmentId: number,
    @Body() dto: CreateMonitoringDto,
  ) {
    return this.treatmentService.createMonitoring(treatmentId, dto);
  }

  // ============================================
  // Endpoints con parámetros genéricos (DEBEN IR AL FINAL)
  // ============================================

  @Get(':medicalHistoryId')
  async getByMedicalHistory(
    @Param('medicalHistoryId') medicalHistoryId: string,
  ) {
    const id = Number(medicalHistoryId);
    return this.treatmentService.findByMedicalHistoryId(id);
  }

  @Post(':medicalHistoryId')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR, RoleCode.DIRECTOR)
  @ZodSerializerDto(CreateTreatmentResponseDto)
  @EnvelopeMessage('Tratamiento creado exitosamente')
  async create(
    @Param('medicalHistoryId', ParseIntPipe) medicalHistoryId: number,
    @Body() dto: CreateTreatmentDto,
    @CurrentUser() user: User,
  ) {
    const medicalHistory =
      await this.medicalHistoryService.findById(medicalHistoryId);
    if (!medicalHistory) {
      throw new NotFoundException('Historia clínica no encontrada');
    }
    if (medicalHistory.currentTreatment) {
      throw new BadRequestException(
        'El paciente ya se encuentra en un tratamiento activo',
      );
    }

    const treatment = await this.treatmentService.createTreatment(
      medicalHistory,
      dto,
      user.id,
    );

    await this.medicalHistoryService.save(medicalHistory);

    return treatment;
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR, RoleCode.DIRECTOR)
  async updateTreatment(
    @Param('id') id: string,
    @Body() dto: UpdateTreatmentDto,
  ) {
    const treatmentId = Number(id);
    const updated = await this.treatmentService.update(treatmentId, {
      ...dto,
      startDate: dto.startDate ?? undefined,
      closureDate: dto.closureDate ?? undefined,
    });
    return {
      message: 'Tratamiento actualizado correctamente',
      id: updated.id,
    };
  }
  @Get(':id/timeline')
  @RequireRoles(RoleCode.PATIENT, RoleCode.DOCTOR, RoleCode.DIRECTOR)
  async getTimeline(
    @Param('id', ParseIntPipe) treatmentId: number,
    @CurrentUser() user: User,
  ) {

    return this.treatmentService.getTimeline(
      treatmentId,
      user.role.code as RoleCode,
    );
  }

  @Post(':id/medical-orders')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR, RoleCode.DIRECTOR)
  async addMedicalOrders(
    @Param('id', ParseIntPipe) treatmentId: number,
    @Body() body: { medicalOrderIds: number[] },
  ) {
    await this.treatmentService.addMedicalOrders(
      treatmentId,
      body.medicalOrderIds,
    );
    return {
      message: 'Órdenes médicas vinculadas correctamente',
    };
  }

  // ============================================
  // Director-only Endpoints
  // ============================================

  @Patch(':id/reassign-doctor')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DIRECTOR)
  async reassignDoctor(
    @Param('id') id: string,
    @Body() dto: { newDoctorId: number },
  ) {
    const treatmentId = Number(id);
    const updated = await this.treatmentService.reassignDoctor(
      treatmentId,
      dto.newDoctorId,
    );
    return {
      message: 'Médico reasignado correctamente',
      treatmentId: updated.id,
      newDoctorId: dto.newDoctorId,
    };
  }
}
