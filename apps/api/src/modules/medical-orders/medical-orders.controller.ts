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
  Put,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MedicalOrdersService } from './medical-orders.service';
import { StudyResultService } from './services/study-result.service';
import { CreateMedicalOrderDto, UpdateMedicalOrderDto, CreateStudyResultDto, UpdateStudyResultDto } from './dto';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { RolesGuard } from '@auth/guards/role-auth.guard';
import { RequireRoles } from '@auth/decorators/require-roles.decorator';
import { RoleCode } from '@repo/contracts';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { User } from '@users/entities/user.entity';
import type { MedicalOrderStatus } from './entities/medical-order.entity';
import { parseDateFromString } from '@common/utils/date.utils';

@Controller('medical-orders')
@UseGuards(JwtAuthGuard)
export class MedicalOrdersController {
  private readonly logger = new Logger(MedicalOrdersController.name);

  constructor(
    private readonly medicalOrdersService: MedicalOrdersService,
    private readonly studyResultService: StudyResultService,
  ) {}

  @Get()
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async getMedicalOrders(
    @Query('treatmentId') treatmentId?: string,
    @Query('patientId') patientId?: string,
    @Query('status') status?: MedicalOrderStatus,
  ) {
    if (treatmentId) {
      return this.medicalOrdersService.findByTreatment(
        Number(treatmentId),
        status,
      );
    }
    if (patientId) {
      return this.medicalOrdersService.findByPatient(
        Number(patientId),
        status,
      );
    }
    return { data: [], message: 'Debe proporcionar treatmentId o patientId' };
  }

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

  @Get(':id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR, RoleCode.LAB_TECHNICIAN)
  async getMedicalOrderDetail(@Param('id') id: string) {
    const orderId = Number(id);
    this.logger.log(`GET /medical-orders/${orderId} - Obteniendo detalle de orden médica`);
    return this.medicalOrdersService.findOneForDoctor(orderId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async createMedicalOrder(
    @Body() dto: CreateMedicalOrderDto,
    @CurrentUser() user: User,
  ) {
    const order = await this.medicalOrdersService.create({
      patientId: dto.patientId,
      doctorId: dto.doctorId,
      treatmentId: dto.treatmentId ?? undefined,
      category: dto.category,
      description: dto.description ?? undefined,
      studies: dto.studies ?? undefined,
      diagnosis: dto.diagnosis ?? undefined,
      justification: dto.justification ?? undefined,
    });

    return {
      message: 'Orden médica creada correctamente',
      data: order,
    };
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async updateMedicalOrder(
    @Param('id') id: string,
    @Body() dto: UpdateMedicalOrderDto,
  ) {
    const orderId = Number(id);
    const updated = await this.medicalOrdersService.update(orderId, {
      category: dto.category,
      description: dto.description,
      studies: dto.studies,
      diagnosis: dto.diagnosis,
      justification: dto.justification,
      status: dto.status,
      completedDate: parseDateFromString(dto.completedDate),
    });
    return {
      message: 'Orden médica actualizada correctamente',
      data: updated,
    };
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
      studyType: dto.studyType ?? null,
      structuredValues: dto.structuredValues ?? null,
      transcription: dto.transcription ?? null,
      originalPdfUri: dto.originalPdfUri ?? null,
      transcribedByLabTechnician: dto.transcribedByLabTechnicianId
        ? ({ id: dto.transcribedByLabTechnicianId } as any)
        : ({ id: user.id } as any),
      transcriptionDate: parseDateFromString(dto.transcriptionDate),
    });

    return {
      message: 'Resultado de estudio creado correctamente',
      id: result.id,
    };
  }

  @Put('study-results/:id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async updateStudyResult(
    @Param('id') id: string,
    @Body() dto: UpdateStudyResultDto,
    @CurrentUser() user: User,
  ) {
    const resultId = Number(id);

    const updateData: Partial<any> = {};

    if ('studyName' in dto) updateData.studyName = dto.studyName;
    if ('determinationName' in dto) updateData.determinationName = dto.determinationName;
    if ('studyType' in dto) updateData.studyType = dto.studyType;
    if ('structuredValues' in dto) updateData.structuredValues = dto.structuredValues;
    if ('transcription' in dto) updateData.transcription = dto.transcription;
    if ('originalPdfUri' in dto) updateData.originalPdfUri = dto.originalPdfUri;
    if ('transcriptionDate' in dto) {
      updateData.transcriptionDate = parseDateFromString(dto.transcriptionDate);
    }

    const updated = await this.studyResultService.update(resultId, updateData, user.id);

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

  // ============================================
  // PDF Generation Endpoints
  // ============================================

  @Post(':id/generate-pdf')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  @UseInterceptors(FileInterceptor('doctorSignature'))
  async generatePdf(
    @Param('id') id: string,
    @UploadedFile() doctorSignature: Express.Multer.File,
  ) {
    this.logger.log(`POST /medical-orders/${id}/generate-pdf - Iniciando generación de PDF`);

    const orderId = Number(id);

    if (!doctorSignature) {
      this.logger.warn(`No se recibió firma del médico para orden ${orderId}`);
      throw new BadRequestException('Se requiere la firma del médico (campo doctorSignature)');
    }

    this.logger.log(`Firma recibida: ${doctorSignature.originalname}, ${doctorSignature.mimetype}, ${doctorSignature.size} bytes`);

    if (!doctorSignature.mimetype.includes('png') && !doctorSignature.mimetype.includes('image')) {
      throw new BadRequestException('La firma debe ser un archivo de imagen');
    }

    const order = await this.medicalOrdersService.generatePdf(orderId, doctorSignature);

    return {
      message: 'PDF generado correctamente',
      data: {
        orderId: order.id,
        pdfUrl: order.pdfUrl,
        generatedAt: order.pdfGeneratedAt,
      },
    };
  }

  @Get(':id/pdf')
  @RequireRoles(RoleCode.PATIENT, RoleCode.DOCTOR)
  async getPdfUrl(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    const orderId = Number(id);

    // Si es paciente, verificar que la orden le pertenezca
    const patientId = user.role.code === RoleCode.PATIENT ? user.id : undefined;

    const pdfUrl = await this.medicalOrdersService.getPdfUrl(orderId, patientId);

    if (!pdfUrl) {
      return {
        message: 'El PDF aún no ha sido generado para esta orden',
        pdfUrl: null,
      };
    }

    return {
      message: 'URL del PDF obtenida correctamente',
      pdfUrl,
    };
  }
}
