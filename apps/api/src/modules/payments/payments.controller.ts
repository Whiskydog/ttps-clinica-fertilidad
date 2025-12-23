import { EnvelopeMessage } from '@common/decorators/envelope-message.decorator';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { RequireRoles } from '@modules/auth/decorators/require-roles.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/role-auth.guard';
import { User } from '@modules/users/entities/user.entity';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RoleCode } from '@repo/contracts';
import { ZodSerializerDto } from 'nestjs-zod';
import { PatientDebtResponseDto } from './dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('own-debt')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleCode.PATIENT)
  @ZodSerializerDto(PatientDebtResponseDto)
  getOwnDebt(@CurrentUser() user: User) {
    return this.paymentsService.getOwnDebt(user.id);
  }

  @Post('settle-own-debt')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleCode.PATIENT)
  @EnvelopeMessage('La deuda ha sido saldada correctamente.')
  settleOwnDebt(@CurrentUser() user: User) {
    return this.paymentsService.settlePatientDebt(user.id);
  }

  @Get('obras-sociales')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleCode.DIRECTOR)
  getObrasSociales() {
    return this.paymentsService.getObrasSociales();
  }

  @Get('group-payments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleCode.DIRECTOR)
  getGroupPayments() {
    return this.paymentsService.getGroupPayments();
  }

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleCode.DIRECTOR)
  registerPayment(
    @Body()
    payload: {
      id_grupo: number;
      id_pago: number;
      obra_social_pagada: boolean;
      paciente_pagado: boolean;
    },
  ) {
    return this.paymentsService.registerPayment(payload);
  }
}
