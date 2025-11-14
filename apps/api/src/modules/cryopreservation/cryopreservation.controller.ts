import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CryopreservationService } from './cryopreservation.service';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { RequireRoles } from '@auth/decorators/require-roles.decorator';
import { RoleCode } from '@repo/contracts';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { User } from '@users/entities/user.entity';

@Controller('cryopreservation')
@UseGuards(JwtAuthGuard)
export class CryopreservationController {
  constructor(
    private readonly cryopreservationService: CryopreservationService,
  ) {}

  @Get('patient/summary')
  @RequireRoles(RoleCode.PATIENT)
  async getPatientSummary(@CurrentUser() user: User) {
    return this.cryopreservationService.getSummaryByPatient(user.id);
  }

  @Get('patient/:productId')
  @RequireRoles(RoleCode.PATIENT)
  async getPatientProductDetail(
    @Param('productId') productId: string,
    @CurrentUser() user: User,
  ) {
    return this.cryopreservationService.findOne(productId, user.id);
  }
}
