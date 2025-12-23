import * as z from "zod";
import { ApiResponseSchema, PaginatedResponseSchema } from "../common/api";
import { MedicalInsuranceSchema } from "../medical-insurances/schemas";
import { BiologicalSex, RoleCode } from "./enums";

export const UserEntitySchema = z.object({
  id: z.int().positive(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.email(),
  phone: z.string().min(7).max(15),
  role: z.object({
    code: z.enum(RoleCode),
    name: z.string(),
  }),
});
export type User = z.infer<typeof UserEntitySchema>;

export const UserResponseSchema = ApiResponseSchema(UserEntitySchema);

export type UserResponse = z.infer<typeof UserResponseSchema>;

export const DoctorEntitySchema = UserEntitySchema.extend({
  specialty: z.string().max(100).nullable(),
  licenseNumber: z.string().max(50).nullable(),
  signatureUri: z.string().nullable().optional(),
});
export type Doctor = z.infer<typeof DoctorEntitySchema>;

export const DoctorResponseSchema = ApiResponseSchema(DoctorEntitySchema);
export const DoctorsResponseSchema = ApiResponseSchema(
  z.array(DoctorEntitySchema)
);
export type DoctorResponse = z.infer<typeof DoctorResponseSchema>;
export type DoctorsResponse = z.infer<typeof DoctorsResponseSchema>;

// =====================

export const PatientCreateSchema = z.object({
  firstName: z
    .string({ error: "Nombre es requerido" })
    .min(1, { error: "Nombre es obligatorio" })
    .min(2, { error: "Nombre muy corto" })
    .max(100, { error: "Nombre muy largo" })
    .trim(),
  lastName: z
    .string({ error: "Apellido es requerido" })
    .min(1, { error: "Apellido es obligatorio" })
    .min(2, { error: "Apellido muy corto" })
    .max(100, { error: "Apellido muy largo" })
    .trim(),
  email: z.email({ error: "Email inválido" }),
  phone: z
    .string({ error: "Teléfono es requerido" })
    .min(1, { error: "Teléfono es obligatorio" })
    .min(7, { error: "Teléfono muy corto" })
    .max(15, { error: "Teléfono muy largo" }),
  address: z.string().max(100, { error: "Dirección muy larga" }).optional(),
  password: z
    .string({ error: "Contraseña es requerida" })
    .min(6, { error: "Contraseña muy corta" })
    .max(100, { error: "Contraseña muy larga" }),
  dni: z
    .string({ error: "DNI es requerido" })
    .min(1, { error: "DNI es obligatorio" })
    .min(5, { error: "DNI muy corto" })
    .max(20, { error: "DNI muy largo" }),
  dateOfBirth: z.iso.date({ error: "Fecha de nacimiento inválida" }),
  medicalInsuranceName: z
    .string({ error: "Obra social es requerida" })
    .min(1, { error: "Obra social es obligatoria" })
    .max(100, { error: "Obra social muy larga" })
    .optional(),
  insuranceNumber: z
    .string({ error: "Número de afiliado es requerido" })
    .min(1, { error: "Número de afiliado es obligatorio" })
    .min(5, { error: "Número de afiliado muy corto" })
    .max(50, { error: "Número de afiliado muy largo" })
    .optional(),
  occupation: z.string().max(100, { error: "Ocupación muy larga" }).optional(),
  biologicalSex: z.enum(BiologicalSex, {
    error: "Sexo biológico es requerido",
  }),
});

export const PatientUpdateSchema = PatientCreateSchema.partial();

const PatientEntitySchema = UserEntitySchema.safeExtend({
  address: z
    .string()
    .max(100)
    .nullable()
    .transform((val) => val ?? undefined),
  dni: z.string().min(5).max(20),
  dateOfBirth: z.coerce.date(),
  occupation: z
    .string()
    .min(1)
    .max(100)
    .nullable()
    .transform((val) => val ?? undefined),
  biologicalSex: z.enum(BiologicalSex),
  medicalInsurance: MedicalInsuranceSchema.nullable(),
  coverageMemberId: z
    .string()
    .min(5)
    .max(100)
    .nullable()
    .transform((val) => val ?? undefined),
});

const PatientSchema = PatientEntitySchema.transform(
  ({ medicalInsurance, coverageMemberId, ...rest }) => ({
    ...rest,
    medicalInsuranceName: medicalInsurance?.name,
    insuranceNumber: coverageMemberId,
  })
);

export type Patient = z.infer<typeof PatientSchema>;

export const PatientResponseSchema = ApiResponseSchema(PatientSchema);

export type PatientResponse = z.infer<typeof PatientResponseSchema>;

export const PatientsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  q: z.string().optional(),
});

export type PatientsQuery = z.infer<typeof PatientsQuerySchema>;

export const PatientsPaginatedResponseSchema =
  PaginatedResponseSchema(PatientSchema);

export type PatientsPaginatedResponse = z.infer<
  typeof PatientsPaginatedResponseSchema
>;

// =====================

const UserType = ["admin", "doctor", "director", "lab_technician"] as const;

// Schema para horarios de turnos (usado al crear médicos)
export const TurnoHorarioSchema = z.object({
  dia_semana: z.number().int().min(0).max(6), // 0=Dom, 1=Lun, ..., 6=Sab
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, "Formato debe ser HH:MM"),
  hora_fin: z.string().regex(/^\d{2}:\d{2}$/, "Formato debe ser HH:MM"),
});

export type TurnoHorario = z.infer<typeof TurnoHorarioSchema>;

export const AdminUserCreateSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().min(7).max(15),
  address: z.string().max(100).optional(),
  password: z.string().min(6).max(100),
  isActive: z.boolean().default(true),
  userType: z.enum(UserType),
  // Doctor/Director fields
  specialty: z.string().max(100).optional(),
  licenseNumber: z.string().max(50).optional(),
  // Lab Technician fields
  labArea: z.string().max(100).optional(),
  // Turnos para médicos (opcional)
  turnos: z.array(TurnoHorarioSchema).optional(),
});

export type AdminUserCreate = z.infer<typeof AdminUserCreateSchema>;

export const AdminUserUpdateSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(7).max(15).optional(),
  address: z.string().max(100).optional(),
  userType: z.enum(UserType).optional(),
  // Doctor/Director fields
  specialty: z.string().max(100).optional(),
  licenseNumber: z.string().max(50).optional(),
  // Lab Technician fields
  labArea: z.string().max(100).optional(),
});
export type AdminUserUpdate = z.infer<typeof AdminUserUpdateSchema>;

export const ToggleUserStatusSchema = z.object({
  isActive: z.boolean(),
});
export type ToggleUserStatus = z.infer<typeof ToggleUserStatusSchema>;

export const ResetPasswordSchema = z.object({
  password: z.string().min(6).max(100),
});
export type ResetPassword = z.infer<typeof ResetPasswordSchema>;

// =====================
// Staff Users List Response (with pagination)
// =====================

export const StaffUserEntitySchema = UserEntitySchema.extend({
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  specialty: z.string().max(100).optional().nullable(),
  licenseNumber: z.string().max(50).optional().nullable(),
  labArea: z.string().max(100).optional().nullable(),
});

export type StaffUser = z.infer<typeof StaffUserEntitySchema>;

export const StaffUsersPaginationMetaSchema = z.object({
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  perPage: z.number().int().min(1),
  totalPages: z.number().int().min(0),
});

export type StaffUsersPaginationMeta = z.infer<
  typeof StaffUsersPaginationMetaSchema
>;

export const StaffUsersListDataSchema = z.object({
  data: z.array(StaffUserEntitySchema),
  meta: StaffUsersPaginationMetaSchema,
});

export type StaffUsersListData = z.infer<typeof StaffUsersListDataSchema>;

export const StaffUsersListResponseSchema = ApiResponseSchema(
  StaffUsersListDataSchema
);

export type StaffUsersListResponse = z.infer<
  typeof StaffUsersListResponseSchema
>;
