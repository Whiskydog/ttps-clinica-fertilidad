import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { RequireRoles } from '@modules/auth/decorators/require-roles.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/role-auth.guard';
import { User } from '@modules/users/entities/user.entity';
import { Controller, Get, UseGuards } from '@nestjs/common';
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
}
