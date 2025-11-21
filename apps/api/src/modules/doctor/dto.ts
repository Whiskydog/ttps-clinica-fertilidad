import { createZodDto } from 'nestjs-zod';
import {
  DashboardKPIsSchema,
  MonthlyStatsSchema,
  DoctorAlertSchema,
  RecentTreatmentSchema,
  TodayAppointmentSchema,
} from '@repo/contracts';

// Response DTOs - utilizados para validación de respuestas
export class DashboardKPIsDto extends createZodDto(DashboardKPIsSchema) {}
export class MonthlyStatsDto extends createZodDto(MonthlyStatsSchema) {}
export class DoctorAlertDto extends createZodDto(DoctorAlertSchema) {}
export class RecentTreatmentDto extends createZodDto(RecentTreatmentSchema) {}
export class TodayAppointmentDto extends createZodDto(TodayAppointmentSchema) {}
