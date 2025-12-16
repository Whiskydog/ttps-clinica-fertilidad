import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { RolesGuard } from '@auth/guards/role-auth.guard';
import { RequireRoles } from '@auth/decorators/require-roles.decorator';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { User } from '@users/entities/user.entity';
import { RoleCode } from '@repo/contracts';
import { MonitoringPlanService } from '../services/monitoring-plan.service';
import { MonitoringPlanStatus } from '../entities/monitoring-plan.entity';
import { TreatmentsService } from '../treatments.service';
import moment from 'moment';

@Controller('monitoring-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonitoringPlansController {
  constructor(
    private readonly monitoringPlanService: MonitoringPlanService,
    private readonly treatmentsService: TreatmentsService,
  ) {}

  @Post()
  @RequireRoles(RoleCode.DOCTOR)
  async createMany(
    @Body()
    body: {
      treatmentId: number;
      rows: { sequence: number; plannedDay: number }[];
    },
    @CurrentUser() user: User,
  ) {
    const { treatmentId, rows } = body;

    if (!treatmentId || !Number.isInteger(treatmentId)) {
      throw new BadRequestException('treatmentId inválido');
    }
    if (!rows?.length) {
      throw new BadRequestException('No se recibieron planes de monitoreo');
    }

   
    const detail = await this.treatmentsService.getTreatmentDetail(
      treatmentId,
      user.id,
      user.role.code as RoleCode,
    );

    const protocol = detail.protocol;

    if (!protocol || !protocol.startDate) {
      throw new BadRequestException(
        'El tratamiento no tiene protocolo con fecha de inicio',
      );
    }

    const stimulationStart = moment(protocol.startDate);

    // Reglas de días
    const sorted = [...rows].sort((a, b) => a.sequence - b.sequence);

    for (let i = 0; i < sorted.length; i++) {
      const d = sorted[i].plannedDay;

      if (!Number.isFinite(d) || d < 1 || d > 31) {
        throw new BadRequestException(
          `plannedDay inválido (${d}). Debe estar entre 1 y 31.`,
        );
      }
      if (i > 0 && d < sorted[i - 1].plannedDay) {
        throw new BadRequestException(
          `plannedDay inválido: el monitoreo ${sorted[i].sequence} no puede ser anterior al ${sorted[i - 1].sequence}`,
        );
      }
    }

    // Idempotente: si ya había planes, los reemplazamos
    await this.monitoringPlanService.deleteByTreatment(treatmentId);

    // Crear
    for (const row of sorted) {
      const estimated = stimulationStart.clone().add(row.plannedDay, 'days');

      const minDate = estimated.clone().subtract(1, 'day').toDate();
      const maxDate = estimated.clone().add(1, 'day').toDate();
      await this.monitoringPlanService.create({
        treatmentId,
        sequence: row.sequence,
        plannedDay: row.plannedDay,
        minDate,
        maxDate,
      });
    }

    return {
      message: 'Planes de monitoreo creados correctamente',
      count: sorted.length,
    };
  }

  @Get('treatment/:treatmentId')
  @RequireRoles(RoleCode.DOCTOR, RoleCode.PATIENT)
  async getByTreatment(
    @Param('treatmentId', ParseIntPipe) treatmentId: number,
  ) {
    return this.monitoringPlanService.findByTreatment(treatmentId);
  }

  @Patch(':id')
  @RequireRoles(RoleCode.PATIENT, RoleCode.DOCTOR)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: Partial<{
      status: MonitoringPlanStatus;
      appointmentId: number | null;
    }>,
  ) {
    return this.monitoringPlanService.update(id, body);
  }

  @Delete(':id')
  @RequireRoles(RoleCode.DOCTOR)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.monitoringPlanService.remove(id);
    return { message: 'Plan de monitoreo eliminado' };
  }
}
