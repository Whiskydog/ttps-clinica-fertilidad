import {
  AdminUserCreateSchema,
  AdminUserUpdateSchema,
  DoctorResponseSchema,
  DoctorsResponseSchema,
  PatientCreateSchema,
  PatientResponseSchema,
  PatientsPaginatedResponseSchema,
  PatientsQuerySchema,
  ResetPasswordSchema,
  StaffUsersListResponseSchema,
  ToggleUserStatusSchema,
  UserResponseSchema,
} from '@repo/contracts';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class UserResponseDto extends createZodDto(UserResponseSchema) {}

export class DoctorResponseDto extends createZodDto(DoctorResponseSchema) {}
export class DoctorsResponseDto extends createZodDto(DoctorsResponseSchema) {}

// Patient DTOs
export class PatientCreateDto extends createZodDto(PatientCreateSchema) {}
export class PatientResponseDto extends createZodDto(PatientResponseSchema) {}

export class PatientsQueryDto extends createZodDto(PatientsQuerySchema) {}
export class PatientsPaginatedResponseDto extends createZodDto(
  PatientsPaginatedResponseSchema,
) {}

// Admin DTOs
export class AdminUserCreateDto extends createZodDto(AdminUserCreateSchema) {}
export class AdminUserUpdateDto extends createZodDto(AdminUserUpdateSchema) {}
export class UsersListResponseDto extends createZodDto(
  StaffUsersListResponseSchema,
) {}

const GetStaffUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(10),
});

export class GetStaffUsersQueryDto extends createZodDto(
  GetStaffUsersQuerySchema,
) {}

export class ToggleUserStatusDto extends createZodDto(
  ToggleUserStatusSchema,
) {}

export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) {}
