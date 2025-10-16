import { pgTable, uuid, varchar, timestamp, text, pgEnum } from 'drizzle-orm/pg-core';
import { UserRole, UserStatus } from '@repo/types';

/**
 * Enums for PostgreSQL
 */
export const userRoleEnum = pgEnum('user_role', [
  UserRole.ADMIN,
  UserRole.DOCTOR,
  UserRole.PATIENT,
  UserRole.LABORATORY_TECHNICIAN,
]);

export const userStatusEnum = pgEnum('user_status', [
  UserStatus.ACTIVE,
  UserStatus.INACTIVE,
  UserStatus.SUSPENDED,
  UserStatus.PENDING_VERIFICATION,
]);

/**
 * Users table schema
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Authentication
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),

  // Basic info
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),

  // User metadata
  role: userRoleEnum('role').notNull().default(UserRole.PATIENT),
  status: userStatusEnum('status').notNull().default(UserStatus.PENDING_VERIFICATION),
  avatarUrl: text('avatar_url'),

  // Profile metadata
  dateOfBirth: timestamp('date_of_birth', { mode: 'date' }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  country: varchar('country', { length: 100 }),

  // Emergency contact
  emergencyContactName: varchar('emergency_contact_name', { length: 200 }),
  emergencyContactPhone: varchar('emergency_contact_phone', { length: 20 }),

  // Medical staff specific fields
  specialization: varchar('specialization', { length: 200 }),
  licenseNumber: varchar('license_number', { length: 100 }),

  // Patient specific fields
  medicalHistory: text('medical_history'),
  allergies: text('allergies'),
  currentMedications: text('current_medications'),

  // Audit fields
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
