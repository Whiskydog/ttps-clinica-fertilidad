export * from "./appointments/schemas";
export * from "./audit/schemas";
export * from "./auth/schemas";
export * from "./auth/types";
export * from "./common/api";
export * from "./cryopreservation/schemas";
export * from "./doctor/schemas";
export * from "./laboratory/enums";
export * from "./laboratory/schemas";
export * from "./medical-insurances/schemas";
export * from "./medical-history/schemas";
export * from "./medical-history/enums";
export * from "./medical-orders/schemas";
export * from "./treatments/enums";
export * from "./treatments/schemas";
export * from "./users";
export * from "./validations/errors";

// Exportar tipos específicos de tratamientos
export type {
  Treatment,
  Monitoring,
  MedicationProtocol,
  DoctorNote,
  TreatmentDetail,
} from "./treatments/schemas";

// Exportar tipos específicos de órdenes médicas
export type {
  Study,
  MedicalOrderStatus,
  MedicalOrder,
  MedicalOrderDetail,
} from "./medical-orders/schemas";

// Exportar tipos específicos de criopreservación
export type {
  JourneyStep,
  CryopreservationSummary,
} from "./cryopreservation/schemas";

// Exportar tipos específicos de laboratory
export type {
  PunctureRecord,
  Oocyte,
  OocyteStateHistory,
  Embryo,
  PunctureRecordDetail,
  OocyteDetail,
  EmbryoDetail,
} from "./laboratory/schemas";

// Exportar tipos específicos de medical history extensions
export type {
  Habits,
  Fenotype,
  Background,
} from "./medical-history/schemas";

// Exportar tipos específicos de treatment extensions
export type {
  InformedConsent,
  PostTransferMilestone,
  MedicalCoverage,
} from "./treatments/schemas";

// Exportar tipos específicos de study results
export type {
  StudyResult,
} from "./medical-orders/schemas";

// Exportar tipos específicos de doctor dashboard
export type {
  DashboardKPIs,
  MonthlyStats,
  AlertType,
  DoctorAlert,
  DashboardAlerts,
  RecentTreatment,
  RecentTreatmentsResponse,
  TodayAppointment,
  TodayAppointmentsResponse,
} from "./doctor/schemas";