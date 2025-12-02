import { Controller, Get, UseGuards } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { RolesGuard } from '@auth/guards/role-auth.guard';
import { RequireRoles } from '@auth/decorators/require-roles.decorator';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { User } from '@users/entities/user.entity';
import { RoleCode } from '@repo/contracts';

@Controller('doctor')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(RoleCode.DOCTOR)
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Get('dashboard/kpis')
  async getDashboardKPIs(@CurrentUser() user: User) {
    return this.doctorService.getDashboardKPIs(user.id);
  }

  @Get('dashboard/monthly-stats')
  async getMonthlyStats(@CurrentUser() user: User) {
    return this.doctorService.getMonthlyStats(user.id);
  }

  @Get('dashboard/alerts')
  async getDashboardAlerts(@CurrentUser() user: User) {
    return this.doctorService.getDashboardAlerts(user.id);
  }

  @Get('dashboard/recent-treatments')
  async getRecentTreatments(@CurrentUser() user: User) {
    return this.doctorService.getRecentTreatments(user.id);
  }

  @Get('dashboard/today-appointments')
  async getTodayAppointments(@CurrentUser() user: User) {
    return this.doctorService.getTodayAppointments(user.id);
  }
}
