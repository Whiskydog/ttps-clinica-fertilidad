import {
  Controller,
  Get,
  Param,
  Query,
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
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(RoleCode.DIRECTOR)
export class AuditController {
  constructor(
    private readonly auditService: AuditService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * GET /audit - Obtiene todos los logs con filtros y paginación
   */
  @Get()
  async getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('tableName') tableName?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.auditService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      userId: userId ? Number(userId) : undefined,
      tableName: tableName || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
  }

  /**
   * GET /audit/tables - Obtiene lista de tablas auditadas
   */
  @Get('tables')
  async getTables() {
    const tables = await this.auditService.getDistinctTables();
    return { data: tables };
  }

  /**
   * GET /audit/users - Obtiene lista de usuarios que han hecho cambios
   */
  @Get('users')
  async getUsers() {
    const users = await this.auditService.getDistinctUsers();
    return { data: users };
  }

  /**
   * GET /audit/user/:userId - Obtiene logs por usuario específico
   */
  @Get('user/:userId')
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
