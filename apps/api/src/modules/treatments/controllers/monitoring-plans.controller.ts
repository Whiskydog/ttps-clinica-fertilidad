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
import { Logger } from '@nestjs/common';
@Controller('monitoring-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonitoringPlansController {
  constructor(
    private readonly monitoringPlanService: MonitoringPlanService,
    private readonly treatmentsService: TreatmentsService,
  ) {}

  @Post('finalize')
  @RequireRoles(RoleCode.DOCTOR)
  async finalizeMonitoringPlans(
    @Body()
    body: {
      treatmentId: number;
      rows: {
        sequence: number;
        plannedDay: number;
        appointmentId?: number;
        isOvertime: boolean;
      }[];
    },
    @CurrentUser() user: User,
  ) {
   
    const { treatmentId, rows } = body;

    if (!Array.isArray(rows)) {
      throw new BadRequestException('rows debe ser un array');
    }

     await this.monitoringPlanService.deleteByTreatment(treatmentId);

    const treatment = await this.treatmentsService.getTreatmentDetail(
      treatmentId,
      user.id,
      user.role.code as RoleCode,
    );
     if (!treatment.protocol.startDate) {
      throw new BadRequestException(
        'La fecha de inicio de estimulación no está definida',
      );
    }

    const stimulationStart = moment(treatment.protocol.startDate);
    
    for (const m of rows) {
      
      const estimated = stimulationStart.clone().add(m.plannedDay, 'days');
      const minDate = estimated.clone().subtract(1, 'day').toDate();
      const maxDate = estimated.clone().add(1, 'day').toDate();

      const plan = await this.monitoringPlanService.create({
        treatmentId,
        plannedDay: m.plannedDay,
        minDate,
        maxDate,
        sequence: m.sequence,
      });
     
      if (m.appointmentId) {
        await this.monitoringPlanService.assignExternalAppointment(
          plan.id,
          m.appointmentId,
        );
      } else if (m.isOvertime) {
        await this.monitoringPlanService.createOvertimeAppointment(plan.id);
      }
    }

    await this.monitoringPlanService.sendMonitoringEmail(treatmentId);

    return { success: true };
  }

  @Get('treatment/:treatmentId/available-slots')
  @RequireRoles(RoleCode.DOCTOR)
  getAvailableSlots(@Param('treatmentId', ParseIntPipe) treatmentId: number) {
    return this.monitoringPlanService.getAvailableSlotsByTreatment(treatmentId);
  }

  @Post()
  @RequireRoles(RoleCode.DOCTOR)
  async createMany(
    @Body()
    body: {
      treatmentId: number;
      monitorings: {
        sequence: number;
        plannedDay: number;
        appointmentId?: number;
        isOvertime: boolean;
      }[];
    },
    @CurrentUser() user: User,
  ) {
    const { treatmentId, monitorings } = body;

    await this.monitoringPlanService.deleteByTreatment(treatmentId);
    await this.treatmentsService.getTreatmentDetail(
      treatmentId,
      user.id,
      user.role.code as RoleCode,
    );
    const treatment = await this.treatmentsService.getTreatmentDetail(
      treatmentId,
      user.id,
      user.role.code as RoleCode,
    );
    if (!treatment.protocol.startDate) {
      throw new BadRequestException(
        'La fecha de inicio de estimulación no está definida para este tratamiento',
      );
    }

    const stimulationStart = moment(treatment.protocol.startDate);
    for (const m of monitorings) {
      const estimated = stimulationStart.clone().add(m.plannedDay, 'days');
      const minDate = estimated.clone().subtract(1, 'day').toDate();
      const maxDate = estimated.clone().add(1, 'day').toDate();
      const plan = await this.monitoringPlanService.create({
        treatmentId,
        sequence: m.sequence,
        plannedDay: m.plannedDay,
        minDate,
        maxDate,
      });

      if (m.appointmentId) {
        await this.monitoringPlanService.assignExternalAppointment(
          plan.id,
          m.appointmentId,
        );
      }

      if (m.isOvertime) {
        await this.monitoringPlanService.createOvertimeAppointment(plan.id);
      }
    }

    await this.monitoringPlanService.sendMonitoringEmail(treatmentId);

    return { success: true };
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
