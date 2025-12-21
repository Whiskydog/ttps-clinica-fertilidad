import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { LaboratoryService } from './laboratory.service';
import { PunctureRecordService } from './services/puncture-record.service';
import { OocyteService } from './services/oocyte.service';
import { OocyteStateHistoryService } from './services/oocyte-state-history.service';
import { EmbryoService } from './services/embryo.service';
import {
  CreatePunctureRecordDto,
  UpdatePunctureRecordDto,
  CreateOocyteDto,
  UpdateOocyteDto,
  CreateOocyteStateHistoryDto,
  UpdateOocyteStateHistoryDto,
  CreateEmbryoDto,
  UpdateEmbryoDto,
  UpdateEmbryoPgtDto,
} from './dto';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { RolesGuard } from '@auth/guards/role-auth.guard';
import { RequireRoles } from '@auth/decorators/require-roles.decorator';
import { RoleCode, OocyteState, EmbryoDisposition, PgtResult } from '@repo/contracts';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { User } from '@users/entities/user.entity';
import { parseDateFromString } from '@common/utils/date.utils';

@Controller('laboratory')
@UseGuards(JwtAuthGuard)
export class LaboratoryController {
  constructor(
    private readonly laboratoryService: LaboratoryService,
    private readonly punctureRecordService: PunctureRecordService,
    private readonly oocyteService: OocyteService,
    private readonly oocyteStateHistoryService: OocyteStateHistoryService,
    private readonly embryoService: EmbryoService,
  ) {}

  // ============================================
  // General Endpoints for Selects
  // ============================================

  @Get('treatments')
  @RequireRoles(RoleCode.LAB_TECHNICIAN)
  async getTreatmentsByPatientDni(@Query('patientDni') patientDni: string) {
    return this.laboratoryService.findTreatmentsByPatientDni(patientDni);
  }

  @Get('puncture-records')
  @RequireRoles(RoleCode.LAB_TECHNICIAN)
  async getAllPunctureRecords(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.laboratoryService.findAllPunctureRecords(pageNum, limitNum);
  }

  @Get('oocytes/mature')
  @RequireRoles(RoleCode.LAB_TECHNICIAN)
  async getMatureNonCryopreservedOocytes() {
    return this.laboratoryService.findMatureNonCryopreservedOocytes();
  }

  // ============================================
  // Puncture Record Endpoints
  // ============================================

  @Post('puncture-records')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async createPunctureRecord(
    @Body() dto: CreatePunctureRecordDto,
    @CurrentUser() user: User,
  ) {
    const record = await this.punctureRecordService.create({
      treatment: { id: dto.treatmentId } as any,
      punctureDateTime: parseDateFromString(dto.punctureDate),
      operatingRoomNumber: dto.operatingRoomNumber
        ? Number(dto.operatingRoomNumber)
        : null,
      labTechnician: dto.labTechnicianId
        ? ({ id: dto.labTechnicianId } as any)
        : ({ id: user.id } as any),
      observations: dto.observations ?? null,
    });
    return {
      message: 'Registro de punción creado correctamente',
      id: record.id,
    };
  }

  @Patch('puncture-records/:id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async updatePunctureRecord(
    @Param('id') id: string,
    @Body() dto: UpdatePunctureRecordDto,
  ) {
    const recordId = Number(id);
    const updated = await this.punctureRecordService.update(recordId, {
      punctureDateTime: parseDateFromString(dto.punctureDate) ?? undefined,
      observations: dto.observations ?? undefined,
    });
    return {
      message: 'Registro de punción actualizado correctamente',
      id: updated.id,
    };
  }

  @Delete('puncture-records/:id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async deletePunctureRecord(@Param('id') id: string) {
    const recordId = Number(id);
    await this.punctureRecordService.remove(recordId);
    return {
      message: 'Registro de punción eliminado correctamente',
    };
  }

  @Get('puncture-records/treatment/:treatmentId')
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async getPunctureRecordsByTreatment(
    @Param('treatmentId') treatmentId: string,
  ) {
    const treatmentIdNum = Number(treatmentId);
    return this.punctureRecordService.findByTreatmentId(treatmentIdNum);
  }

  // ============================================
  // Oocyte Endpoints
  // ============================================

  @Post('oocytes')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async createOocyte(@Body() dto: CreateOocyteDto) {
    const oocyte = await this.oocyteService.create({
      puncture: { id: dto.punctureRecordId } as any,
      currentState: dto.currentState,
      isCryopreserved: dto.cryopreservationDate ? true : false,
      cryoTank: dto.tankNumber ?? null,
      cryoRack: dto.canisterNumber ?? null,
      cryoTube: dto.caneNumber ?? null,
    });
    return {
      message: 'Oocito creado correctamente',
      id: oocyte.id,
    };
  }

  @Patch('oocytes/:id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async updateOocyte(@Param('id') id: string, @Body() dto: UpdateOocyteDto) {
    const oocyteId = Number(id);
    const updated = await this.oocyteService.update(oocyteId, {
      currentState: dto.currentState ?? undefined,
      isCryopreserved:
        dto.cryopreservationDate !== undefined
          ? dto.cryopreservationDate
            ? true
            : false
          : undefined,
      cryoTank: dto.tankNumber ?? undefined,
      cryoRack: dto.canisterNumber ?? undefined,
      cryoTube: dto.caneNumber ?? undefined,
    });
    return {
      message: 'Oocito actualizado correctamente',
      id: updated.id,
    };
  }

  @Delete('oocytes/:id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async deleteOocyte(@Param('id') id: string) {
    const oocyteId = Number(id);
    await this.oocyteService.remove(oocyteId);
    return {
      message: 'Oocito eliminado correctamente',
    };
  }

  @Post('oocytes/:id/cryopreserve')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async cryopreserveOocyte(@Param('id') id: string) {
    const oocyteId = Number(id);
    const result = await this.laboratoryService.cryopreserveOocyte(oocyteId);
    return {
      message: 'Oocito criopreservado correctamente',
      tank: result.tank,
      rack: result.rack,
    };
  }

  @Post('oocytes/:id/cultivate')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async cultivateOocyte(
    @Param('id') id: string,
    @Body() body: { cultivationDate: string },
  ) {
    const oocyteId = Number(id);
    await this.oocyteService.cultivate(
      oocyteId,
      new Date(body.cultivationDate),
    );
    return {
      message: 'Oocito cultivado correctamente',
    };
  }

  @Post('oocytes/:id/mature')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async matureOocyte(@Param('id') id: string) {
    const oocyteId = Number(id);
    await this.oocyteService.mature(oocyteId);
    return {
      message: 'Oocito madurado correctamente',
    };
  }

  @Post('oocytes/:id/finish-cultivation')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async finishCultivation(
    @Param('id') id: string,
    @Body() body: { success: boolean; cause?: string },
  ) {
    const oocyteId = Number(id);
    await this.oocyteService.finishCultivation(oocyteId, body.success, body.cause);
    return {
      message: body.success
        ? 'Cultivo finalizado: ovocito madurado correctamente'
        : 'Cultivo finalizado: ovocito descartado',
    };
  }

  @Get('oocytes/:id/state-history')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async getOocyteStateHistory(@Param('id') id: string) {
    const oocyteId = Number(id);
    return this.oocyteStateHistoryService.findByOocyteId(oocyteId);
  }

  @Get('oocytes/:id/patient')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async getPatientByOocyteId(@Param('id') id: string) {
    const oocyteId = Number(id);
    return this.oocyteService.getPatientByOocyteId(oocyteId);
  }

  @Get('oocytes/puncture-record/:punctureRecordId')
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async getOocytesByPunctureRecord(
    @Param('punctureRecordId') punctureRecordId: string,
  ) {
    const punctureRecordIdNum = Number(punctureRecordId);
    return this.oocyteService.findByPunctureRecordId(punctureRecordIdNum);
  }

  @Get('oocytes/state/:state')
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async getOocytesByState(@Param('state') state: OocyteState) {
    return this.oocyteService.findByCurrentState(state);
  }

  @Get('oocytes')
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async getAllOocytes(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.laboratoryService.findAllOocytes(pageNum, limitNum);
  }

  // ============================================
  // Oocyte State History Endpoints
  // ============================================

  @Post('oocyte-state-history')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async createOocyteStateHistory(@Body() dto: CreateOocyteStateHistoryDto) {
    const history = await this.oocyteStateHistoryService.create({
      oocyte: { id: dto.oocyteId } as any,
      previousState: dto.previousState ?? null,
      newState: dto.newState,
      transitionDate: parseDateFromString(dto.changeDate),
    });
    return {
      message: 'Historial de estado de oocito creado correctamente',
      id: history.id,
    };
  }

  @Patch('oocyte-state-history/:id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async updateOocyteStateHistory(
    @Param('id') id: string,
    @Body() dto: UpdateOocyteStateHistoryDto,
  ) {
    const historyId = Number(id);
    const updated = await this.oocyteStateHistoryService.update(historyId, {
      previousState: dto.previousState ?? undefined,
      newState: dto.newState ?? undefined,
      transitionDate: parseDateFromString(dto.changeDate) ?? undefined,
    });
    return {
      message: 'Historial de estado de oocito actualizado correctamente',
      id: updated.id,
    };
  }

  @Delete('oocyte-state-history/:id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async deleteOocyteStateHistory(@Param('id') id: string) {
    const historyId = Number(id);
    await this.oocyteStateHistoryService.remove(historyId);
    return {
      message: 'Historial de estado de oocito eliminado correctamente',
    };
  }

  @Get('oocyte-state-history/oocyte/:oocyteId')
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async getOocyteStateHistoryByOocyte(@Param('oocyteId') oocyteId: string) {
    const oocyteIdNum = Number(oocyteId);
    return this.oocyteStateHistoryService.findByOocyteId(oocyteIdNum);
  }

  // ============================================
  // Embryo Endpoints
  // ============================================

  @Post('embryos')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async createEmbryo(@Body() dto: CreateEmbryoDto, @CurrentUser() user: User) {
    const embryo = await this.embryoService.create(
      {
        oocyteOrigin: { id: dto.oocyteOriginId } as any,
        fertilizationDate: dto.fertilizationDate
          ? parseDateFromString(dto.fertilizationDate as string)
          : undefined,
        fertilizationTechnique: dto.fertilizationTechnique ?? null,
        qualityScore: dto.qualityScore ?? null,
        semenSource: dto.semenSource ?? null,
        donationIdUsed: dto.donationIdUsed ?? null,
        pgtResult: dto.pgtResult ?? null,
        finalDisposition: dto.finalDisposition ?? null,
        cryoTank: dto.tankNumber ?? null,
        cryoRack: dto.canisterNumber ?? null,
        cryoTube: dto.caneNumber ?? null,
        technician: dto.labTechnicianId
          ? ({ id: dto.labTechnicianId } as any)
          : ({ id: user.id } as any),
      },
      dto.donationPhenotype,
    );
    return {
      message: 'Embrión creado correctamente',
      id: embryo.id,
    };
  }

  @Patch('embryos/:id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async updateEmbryo(@Param('id') id: string, @Body() dto: UpdateEmbryoDto) {
    const embryoId = Number(id);
    const updated = await this.embryoService.update(embryoId, {
      fertilizationTechnique: dto.fertilizationTechnique ?? undefined,
      qualityScore: dto.qualityScore ?? undefined,
      semenSource: dto.semenSource ?? undefined,
      pgtResult: dto.pgtResult ?? undefined,
      finalDisposition: dto.finalDisposition ?? undefined,
      cryoTank: dto.tankNumber ?? undefined,
      cryoRack: dto.canisterNumber ?? undefined,
      cryoTube: dto.caneNumber ?? undefined,
    });
    return {
      message: 'Embrión actualizado correctamente',
      id: updated.id,
    };
  }

  @Delete('embryos/:id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async deleteEmbryo(@Param('id') id: string) {
    const embryoId = Number(id);
    await this.embryoService.remove(embryoId);
    return {
      message: 'Embrión eliminado correctamente',
    };
  }

  @Get('embryos/oocyte/:oocyteId')
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async getEmbryosByOocyte(@Param('oocyteId') oocyteId: string) {
    const oocyteIdNum = Number(oocyteId);
    return this.embryoService.findByOocyteOriginId(oocyteIdNum);
  }

  @Get('embryos/cryopreserved')
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async getCryopreservedEmbryos() {
    return this.embryoService.findCryopreserved();
  }

  @Get('embryos/disposition/:disposition')
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async getEmbryosByDisposition(
    @Param('disposition') disposition: EmbryoDisposition,
  ) {
    return this.embryoService.findByDisposition(disposition);
  }

  // endpoints para el resumen de criopreservación para el paciente
  @Get('patient/summary')
  @RequireRoles(RoleCode.PATIENT, RoleCode.DOCTOR)
  async getPatientSummary(@CurrentUser() user: User) {
    const oocytes = await this.oocyteService.findByPatientId(user.id);
    const embryos = await this.embryoService.findByPatientId(user.id);
    return {
      oocytes,
      embryos,
    };
  }

  @Get('patient/oocyte/:id')
  @RequireRoles(RoleCode.PATIENT, RoleCode.DOCTOR)
  async getOocyteDetail(@Param('id') id: string) {
    return this.oocyteService.findOneWithHistory(+id);
  }

  @Get('patient/embryo/:id')
  @RequireRoles(RoleCode.PATIENT, RoleCode.DOCTOR)
  async getEmbryoDetail(@Param('id') id: string) {
    return this.embryoService.findOneWithHistory(+id);
  }

  @Post('generate-oocyte-id')
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async generateOocyteId(
    @Body()
    body: {
      date: string;
      lastName: string;
      firstName: string;
      nn: number;
    },
  ) {
    const date = new Date(body.date);
    const id = this.laboratoryService.generateOocyteId(
      date,
      body.lastName,
      body.firstName,
      body.nn,
    );
    return { id };
  }

  @Post('generate-embryo-id')
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async generateEmbryoId(
    @Body()
    body: {
      date: string;
      lastName: string;
      firstName: string;
      nn: number;
    },
  ) {
    const date = new Date(body.date);
    const id = this.laboratoryService.generateEmbryoId(
      date,
      body.lastName,
      body.firstName,
      body.nn,
    );
    return { id };
  }

  @Patch('oocytes/:id/discard')
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async discardOocyte(
    @Param('id') id: string,
    @Body() body: { cause: string },
  ) {
    const oocyteId = Number(id);
    await this.oocyteService.discard(oocyteId, body.cause);
    return { message: 'Ovocito descartado correctamente' };
  }

  @Post('semen/compatible')
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async getCompatibleSemen(@Body() phenotypeData: any) {
    const donationId =
      await this.laboratoryService.getCompatibleSemenId(phenotypeData);
    return { donationId };
  }

  // ============================================
  // Embryo Management Endpoints
  // ============================================

  @Get('embryos')
  @RequireRoles(RoleCode.LAB_TECHNICIAN, RoleCode.DOCTOR)
  async getEmbryos(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = Number(page);
    const limitNum = Number(limit);
    return this.embryoService.findPaginated(pageNum, limitNum);
  }

  @Post('embryos/:id/cryopreserve')
  @RequireRoles(RoleCode.LAB_TECHNICIAN)
  async cryopreserveEmbryo(
    @Param('id') id: string,
    @Body() body: { tank: string; rack: string; tube: string },
  ) {
    const embryoId = Number(id);
    return this.embryoService.cryopreserve(
      embryoId,
      body.tank,
      body.rack,
      body.tube,
    );
  }

  @Post('embryos/:id/transfer')
  @RequireRoles(RoleCode.LAB_TECHNICIAN)
  async transferEmbryo(@Param('id') id: string) {
    const embryoId = Number(id);
    return this.embryoService.transfer(embryoId);
  }

  @Patch('embryos/:id/discard')
  @RequireRoles(RoleCode.LAB_TECHNICIAN)
  async discardEmbryo(
    @Param('id') id: string,
    @Body() body: { cause: string },
  ) {
    const embryoId = Number(id);
    return this.embryoService.discard(embryoId, body.cause);
  }

  @Patch('embryos/:id/pgt')
  @RequireRoles(RoleCode.LAB_TECHNICIAN)
  async updateEmbryoPgt(
    @Param('id') id: string,
    @Body() dto: UpdateEmbryoPgtDto,
  ) {
    const embryoId = Number(id);
    return this.embryoService.updatePgt(embryoId, dto.pgtResult, dto.pgtDecisionSuggested);
  }

  // ============================================
  // Cryopreserved Semen Endpoints
  // ============================================

  @Post('cryopreserved-semen')
  @RequireRoles(RoleCode.LAB_TECHNICIAN)
  async createCryopreservedSemen(@Body() body: {
    patientDni: string;
    phenotype?: any;
    cryoTank?: string;
    cryoRack?: string;
    cryoTube?: string;
    cryopreservationDate?: string;
  }) {
    const data = {
      ...body,
      cryopreservationDate: body.cryopreservationDate ? new Date(body.cryopreservationDate) : undefined,
    };
    return this.laboratoryService.createCryopreservedSemen(data);
  }

  @Get('cryopreserved-semen/dni/:dni')
  @RequireRoles(RoleCode.LAB_TECHNICIAN)
  async getCryopreservedSemenByDni(@Param('dni') dni: string) {
    return this.laboratoryService.findCryopreservedSemenByDni(dni);
  }

  @Get('cryopreserved-semen/:id')
  @RequireRoles(RoleCode.LAB_TECHNICIAN)
  async getCryopreservedSemenById(@Param('id') id: string) {
    const semenId = Number(id);
    if (isNaN(semenId)) {
      throw new BadRequestException('ID inválido');
    }
    return this.laboratoryService.findCryopreservedSemenById(semenId);
  }

  @Post('cryopreserved-semen/:id/use')
  @RequireRoles(RoleCode.LAB_TECHNICIAN)
  async markLocalSemenAsUsed(@Param('id') id: string) {
    const semenId = Number(id);
    await this.laboratoryService.markLocalSemenAsUsed(semenId);
    return { success: true };
  }

  @Get('semen-viability/:dni')
  @RequireRoles(RoleCode.LAB_TECHNICIAN)
  async checkSemenViability(@Param('dni') dni: string) {
    const result = await this.laboratoryService.checkSemenViability(dni);
    return result;
  }

  @Post('semen-viability/:dni/validate')
  @RequireRoles(RoleCode.LAB_TECHNICIAN)
  async setSemenViability(
    @Param('dni') dni: string,
    @Body() body: {
      status: 'viable' | 'not_viable';
      notes?: string;
      studyReference?: string;
    },
    @CurrentUser() user: User,
  ) {
    const result = await this.laboratoryService.setSemenViability(
      dni,
      body.status,
      body.notes,
      user.id.toString(),
      body.studyReference,
    );
    return {
      message: `Viabilidad de semen ${body.status === 'viable' ? 'confirmada' : 'rechazada'}`,
      data: result,
    };
  }

  @Get('semen-viability/:dni/details')
  @RequireRoles(RoleCode.LAB_TECHNICIAN)
  async getSemenViabilityDetails(@Param('dni') dni: string) {
    const result = await this.laboratoryService.getSemenViability(dni);
    return result;
  }
}
