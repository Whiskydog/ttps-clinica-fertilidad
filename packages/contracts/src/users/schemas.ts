import moment from "moment";
import * as z from "zod";
import { ApiResponseSchema } from "../common/api";
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

export const UserResponseSchema = ApiResponseSchema(UserEntitySchema);

export type UserEntity = z.infer<typeof UserEntitySchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;

export const PaginationMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
  totalPages: z.number(),
});

export const UsersListSchema = z.object({
  data: z.array(UserEntitySchema),
  meta: PaginationMetaSchema,
});

export const UsersListResponseSchema = ApiResponseSchema(UsersListSchema);

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
export type UsersList = z.infer<typeof UsersListSchema>;
export type UsersListResponse = z.infer<typeof UsersListResponseSchema>;

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
  dateOfBirth: z.date(),
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
  ({ dateOfBirth, medicalInsurance, coverageMemberId, ...rest }) => ({
    ...rest,
    dateOfBirth: moment(dateOfBirth).format("YYYY-MM-DD"),
    medicalInsuranceName: medicalInsurance?.name,
    insuranceNumber: coverageMemberId,
  })
);

export const PatientResponseSchema = ApiResponseSchema(PatientSchema);

export type PatientResponse = z.infer<typeof PatientResponseSchema>;

export const PatientsListResponseSchema = ApiResponseSchema(
  z.array(PatientSchema)
);

export type PatientsListResponse = z.infer<typeof PatientsListResponseSchema>;

// Schema para la creacion de usuarios desde panel de admin.  
export const AdminUserCreateSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "Nombre es requerido")
      .min(2, "Nombre muy corto")
      .max(100, "Nombre muy largo")
      .trim(),
    lastName: z
      .string()
      .min(1, "Apellido es requerido")
      .min(2, "Apellido muy corto")
      .max(100, "Apellido muy largo")
      .trim(),
    email: z.string().email("Email inválido"),
    phone: z
      .string()
      .min(7, "Teléfono muy corto")
      .max(15, "Teléfono muy largo"),
    password: z
      .string()
      .min(6, "Contraseña debe tener al menos 6 caracteres")
      .max(100, "Contraseña muy larga"),
    isActive: z.boolean().default(true),
    userType: z.enum(["doctor", "lab_technician", "admin", "director"]),

    // Campos solo de Doctor
    licenseNumber: z.string().optional(),
    specialty: z.string().optional(),
    alternativeContact: z.string().optional(),

    // Campos solo de Lab Technician
    labArea: z.string().optional(),
    internalId: z.string().optional(),
    shift: z.enum(["morning", "afternoon", "night"]).optional(),
  })
  
  .refine(
    (data) => {
      if (data.userType === "doctor") {
        return !!data.licenseNumber && data.licenseNumber.length > 0;
      }
      return true;
    },
    {
      message: "Matrícula es requerida para médicos",
      path: ["licenseNumber"],
    }
  )
  .refine(
    (data) => {
      if (data.userType === "doctor") {
        return !!data.specialty && data.specialty.length > 0;
      }
      return true;
    },
    {
      message: "Especialidad es requerida para médicos",
      path: ["specialty"],
    }
  )
  .refine(
    (data) => {
      if (data.userType === "lab_technician") {
        return !!data.labArea && data.labArea.length > 0;
      }
      return true;
    },
    {
      message: "Área de laboratorio es requerida para técnicos",
      path: ["labArea"],
    }
  )
  .refine(
    (data) => {
      if (data.userType === "director") {
        return !!data.licenseNumber && data.licenseNumber.length > 0;
      }
      return true;
    },
    {
      message: "Matrícula es requerida para directores",
      path: ["licenseNumber"],
    }
  );

export type AdminUserCreate = z.infer<typeof AdminUserCreateSchema>;
