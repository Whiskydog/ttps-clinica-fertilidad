import { z } from "zod";

// ============= Dashboard KPIs =============

export const DashboardKPIsSchema = z.object({
  activePatients: z.number(),
  todayAppointments: z.number(),
  activeMonitorings: z.number(),
  pendingResults: z.number(),
});

export type DashboardKPIs = z.infer<typeof DashboardKPIsSchema>;

// ============= Monthly Stats =============

export const MonthlyStatsSchema = z.object({
  treatmentsStarted: z.number(),
  proceduresPerformed: z.number(),
  transfers: z.number(),
  positiveBetas: z.number(),
  positiveRate: z.number(),
  cryoEmbryos: z.number(),
  fecundationRate: z.number(),
});

export type MonthlyStats = z.infer<typeof MonthlyStatsSchema>;

// ============= Alerts =============

export const AlertTypeSchema = z.enum([
  "urgent",
  "warning",
  "info",
  "success",
]);

export type AlertType = z.infer<typeof AlertTypeSchema>;

export const DoctorAlertSchema = z.object({
  id: z.number(),
  type: AlertTypeSchema,
  title: z.string(),
  message: z.string(),
  patientId: z.number().optional(),
  patientName: z.string().optional(),
  treatmentId: z.number().optional(),
  createdAt: z.string(),
});

export type DoctorAlert = z.infer<typeof DoctorAlertSchema>;

export const DashboardAlertsSchema = z.array(DoctorAlertSchema);

export type DashboardAlerts = z.infer<typeof DashboardAlertsSchema>;

// ============= Recent Treatments =============

export const RecentTreatmentSchema = z.object({
  id: z.number(),
  patientId: z.number(),
  patientName: z.string(),
  status: z.string(),
  lastMovement: z.string(),
  lastMovementDate: z.string(),
});

export type RecentTreatment = z.infer<typeof RecentTreatmentSchema>;

export const RecentTreatmentsResponseSchema = z.array(RecentTreatmentSchema);

export type RecentTreatmentsResponse = z.infer<typeof RecentTreatmentsResponseSchema>;

// ============= Today Appointments =============

export const TodayAppointmentSchema = z.object({
  id: z.number(),
  time: z.string(),
  patientId: z.number(),
  patientName: z.string(),
  appointmentType: z.string(),
  status: z.string(),
});

export type TodayAppointment = z.infer<typeof TodayAppointmentSchema>;

export const TodayAppointmentsResponseSchema = z.array(TodayAppointmentSchema);

export type TodayAppointmentsResponse = z.infer<typeof TodayAppointmentsResponseSchema>;
