import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MedicalOrdersService } from './medical-orders.service';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { RequireRoles } from '@auth/decorators/require-roles.decorator';
import { RoleCode } from '@repo/contracts';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { User } from '@users/entities/user.entity';
import type { MedicalOrderStatus } from './entities/medical-order.entity';

@Controller('medical-orders')
@UseGuards(JwtAuthGuard)
export class MedicalOrdersController {
  constructor(private readonly medicalOrdersService: MedicalOrdersService) {}

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
}
