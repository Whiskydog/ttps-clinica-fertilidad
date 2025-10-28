import {
  Controller,
  Get,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { RolesGuard } from '@auth/guards/role-auth.guard';
import { RequireRoles } from '@auth/decorators/require-roles.decorator';
import { AuditLogsResponseSchema, RoleCode } from '@repo/contracts';
import { UsersService } from '@modules/users/services/users.service';

@Controller('audit')
export class AuditController {
  constructor(
    private readonly auditService: AuditService,
    private readonly usersService: UsersService,
  ) {}

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleCode.ADMIN, RoleCode.DIRECTOR)
  async getByUser(@Param('userId') userId: string) {
    const id = Number(userId);
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const log = await this.auditService.findByUserId(id);
    return AuditLogsResponseSchema.parse(log);
  }
}
