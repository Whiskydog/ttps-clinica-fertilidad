export * from "./appointments/schemas";
export * from "./audit/schemas";
export * from "./auth/schemas";
export * from "./auth/types";
export * from "./common/api";
export * from "./cryopreservation/schemas";
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
  ProductType,
  JourneyStep,
  CryopreservedProduct,
  CryopreservedProductDetail,
  CryopreservationSummary,
} from "./cryopreservation/schemas";