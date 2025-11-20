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
  Delete,
  Patch,
  Query,
} from '@nestjs/common';
import {
  UpdateMedicalHistoryDto,
  PartnerDataUpsertDto,
  GynecologicalUpsertDto,
  CreateHabitsDto,
  UpdateHabitsDto,
  CreateFenotypeDto,
  UpdateFenotypeDto,
  CreateBackgroundDto,
  UpdateBackgroundDto,
} from './dto';
import { MedicalHistoryService } from './services/medical-history.service';
import { HabitsService } from './services/habits.service';
import { FenotypeService } from './services/fenotype.service';
import { BackgroundService } from './services/background.service';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { User } from '@users/entities/user.entity';
import { formatMedicalHistoryForResponse } from './utils';
import { MedicalHistoryValidators } from './validators';
import { MedicalHistoryHandlers } from './handlers';
import { MedicalTermsService } from './services/medical-terms.service';
@Controller('medical-history')
export class MedicalHistoryController {
  private handlers: MedicalHistoryHandlers;

  constructor(
    private readonly medicalHistoryService: MedicalHistoryService,
    private readonly habitsService: HabitsService,
    private readonly fenotypeService: FenotypeService,
    private readonly backgroundService: BackgroundService,
    private readonly medicalTermsService: MedicalTermsService,
  ) {
    this.handlers = new MedicalHistoryHandlers(medicalHistoryService);
  }

  @Get('terms')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async searchMedicalTerms(
    @Query('q') q: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    const pageNum = page ? Number(page) : 1;
    const limitNum = limit ? Number(limit) : 10;
    return this.medicalTermsService.searchTerms(q, pageNum, limitNum);
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

  // endpoint para obtener la historia clínica del paciente
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

  // endpoints para hábitos
  @Post('habits')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async createHabits(@Body() dto: CreateHabitsDto) {
    const habits = await this.habitsService.create({
      medicalHistory: { id: dto.medicalHistoryId } as any,
      cigarettesPerDay: dto.cigarettesPerDay ?? null,
      yearsSmoking: dto.yearsSmoking ?? null,
      packDaysValue: dto.packDaysValue ?? null,
      alcoholConsumption: dto.alcoholConsumption ?? null,
      recreationalDrugs: dto.recreationalDrugs ?? null,
    });
    return {
      message: 'Hábitos creados correctamente',
      id: habits.id,
    };
  }

  @Patch('habits/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async updateHabits(@Param('id') id: string, @Body() dto: UpdateHabitsDto) {
    const habitsId = Number(id);
    const updated = await this.habitsService.update(habitsId, {
      cigarettesPerDay: dto.cigarettesPerDay ?? undefined,
      yearsSmoking: dto.yearsSmoking ?? undefined,
      packDaysValue: dto.packDaysValue ?? undefined,
      alcoholConsumption: dto.alcoholConsumption ?? undefined,
      recreationalDrugs: dto.recreationalDrugs ?? undefined,
    });
    return {
      message: 'Hábitos actualizados correctamente',
      id: updated.id,
    };
  }

  @Delete('habits/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async deleteHabits(@Param('id') id: string) {
    const habitsId = Number(id);
    await this.habitsService.remove(habitsId);
    return {
      message: 'Hábitos eliminados correctamente',
    };
  }

  // endpoints para fenotipos

  @Post('fenotype')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async createFenotype(@Body() dto: CreateFenotypeDto) {
    const fenotype = await this.fenotypeService.create({
      medicalHistory: { id: dto.medicalHistoryId } as any,
      partnerData: dto.partnerDataId
        ? ({ id: dto.partnerDataId } as any)
        : null,
      eyeColor: dto.eyeColor ?? null,
      hairColor: dto.hairColor ?? null,
      hairType: dto.hairType ?? null,
      height: dto.height ?? null,
      complexion: dto.complexion ?? null,
      ethnicity: dto.ethnicity ?? null,
    });
    return {
      message: 'Fenotipo creado correctamente',
      id: fenotype.id,
    };
  }

  @Patch('fenotype/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async updateFenotype(
    @Param('id') id: string,
    @Body() dto: UpdateFenotypeDto,
  ) {
    const fenotypeId = Number(id);
    const updated = await this.fenotypeService.update(fenotypeId, {
      eyeColor: dto.eyeColor ?? undefined,
      hairColor: dto.hairColor ?? undefined,
      hairType: dto.hairType ?? undefined,
      height: dto.height ?? undefined,
      complexion: dto.complexion ?? undefined,
      ethnicity: dto.ethnicity ?? undefined,
    });
    return {
      message: 'Fenotipo actualizado correctamente',
      id: updated.id,
    };
  }

  @Delete('fenotype/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async deleteFenotype(@Param('id') id: string) {
    const fenotypeId = Number(id);
    await this.fenotypeService.remove(fenotypeId);
    return {
      message: 'Fenotipo eliminado correctamente',
    };
  }

  // endpoints para antecedentes

  @Post('background')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async createBackground(@Body() dto: CreateBackgroundDto) {
    const background = await this.backgroundService.create({
      medicalHistory: { id: dto.medicalHistoryId } as any,
      termCode: dto.termCode ?? null,
      backgroundType: dto.backgroundType,
    });
    return {
      message: 'Antecedente creado correctamente',
      id: background.id,
    };
  }

  @Patch('background/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async updateBackground(
    @Param('id') id: string,
    @Body() dto: UpdateBackgroundDto,
  ) {
    const backgroundId = Number(id);
    const updated = await this.backgroundService.update(backgroundId, {
      termCode: dto.termCode ?? undefined,
      backgroundType: dto.backgroundType ?? undefined,
    });
    return {
      message: 'Antecedente actualizado correctamente',
      id: updated.id,
    };
  }

  @Delete('background/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleCode.DOCTOR)
  async deleteBackground(@Param('id') id: string) {
    const backgroundId = Number(id);
    await this.backgroundService.remove(backgroundId);
    return {
      message: 'Antecedente eliminado correctamente',
    };
  }
}
