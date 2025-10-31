import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { RolesGuard } from '@auth/guards/role-auth.guard';
import { RequireRoles } from '@auth/decorators/require-roles.decorator';
import { RoleCode, MedicalHistoryResponseSchema } from '@repo/contracts';
import {
  Controller,
  Post,
  Body,
  UseGuards,
  NotFoundException,
  Get,
  Param,
} from '@nestjs/common';
import {
  UpdateMedicalHistoryDto,
  PartnerDataUpsertDto,
  GynecologicalUpsertDto,
} from './dto';
import { MedicalHistoryService } from './services/medical-history.service';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { User } from '@users/entities/user.entity';
import { formatMedicalHistoryForResponse } from './utils';
import { MedicalHistoryValidators } from './validators';
import { MedicalHistoryHandlers } from './handlers';

@Controller('medical-history')
export class MedicalHistoryController {
  private handlers: MedicalHistoryHandlers;

  constructor(private readonly medicalHistoryService: MedicalHistoryService) {
    this.handlers = new MedicalHistoryHandlers(medicalHistoryService);
  }

  @Post('update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async update(
    @Body() dto: UpdateMedicalHistoryDto,
    @CurrentUser() user: User,
  ) {
    const mhId = Number(dto.id);
    const updated = await this.medicalHistoryService.update(mhId, dto, user.id);
    if (!updated) {
      throw new NotFoundException('Historia clínica no encontrada');
    }
    return {
      message: 'Actualizado correctamente',
      updated: {
        physicalExamNotes: dto.physicalExamNotes,
        familyBackgrounds: dto.familyBackgrounds,
      },
    };
  }

  @Get('patient/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async getByPatientId(@Param('id') id: string) {
    const patientId = Number(id);
    const mh = await this.medicalHistoryService.findByUserId(patientId);
    if (!mh) {
      throw new NotFoundException('Historia clínica no encontrada');
    }
    return mh;
  }

  @Post('partner')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async upsertPartner(
    @Body() dto: PartnerDataUpsertDto,
    @CurrentUser() user: User,
  ) {
    const partner = dto.partnerData;

    // Validar pareja femenina (caso ROPA)
    if (partner?.biologicalSex === 'female') {
      MedicalHistoryValidators.validateFemalePartnerData(dto);
      return this.handlers.handleFemalePartnerUpsert(dto, user);
    }

    // Caso estándar: pareja no femenina
    return this.handlers.handleStandardPartnerUpsert(dto, user);
  }

  @Post('gynecological')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async upsertGynecological(
    @Body() dto: GynecologicalUpsertDto,
    @CurrentUser() user: User,
  ) {
    const saved = await this.medicalHistoryService.upsertGynecologicalHistory(
      dto.medicalHistoryId,
      dto.gynecologicalHistory,
      user.id,
    );
    return {
      message: 'Historial ginecológico guardado',
      id: saved.id,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleCode.PATIENT)
  async getMyMedicalHistory(@CurrentUser() user: User) {
    const mh = await this.medicalHistoryService.findByUserId(user.id);
    if (!mh) {
      throw new NotFoundException('Historia clínica no encontrada');
    }

    return MedicalHistoryResponseSchema.parse(
      formatMedicalHistoryForResponse(mh),
    );
  }
}
