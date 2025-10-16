import { pgTable, uuid, varchar, timestamp, text, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { AppointmentStatus, AppointmentType } from '@repo/types';
import { users } from './users.schema';

/**
 * Enums for PostgreSQL
 */
export const appointmentStatusEnum = pgEnum('appointment_status', [
  AppointmentStatus.SCHEDULED,
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.IN_PROGRESS,
  AppointmentStatus.COMPLETED,
  AppointmentStatus.CANCELLED,
  AppointmentStatus.NO_SHOW,
  AppointmentStatus.RESCHEDULED,
]);

export const appointmentTypeEnum = pgEnum('appointment_type', [
  AppointmentType.CONSULTATION,
  AppointmentType.FOLLOW_UP,
  AppointmentType.PROCEDURE,
  AppointmentType.ULTRASOUND,
  AppointmentType.BLOOD_TEST,
  AppointmentType.IVF_CYCLE,
  AppointmentType.EMBRYO_TRANSFER,
  AppointmentType.EGG_RETRIEVAL,
]);

/**
 * Appointments table schema
 */
export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Foreign keys
  patientId: uuid('patient_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  doctorId: uuid('doctor_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Appointment details
  appointmentType: appointmentTypeEnum('appointment_type').notNull(),
  status: appointmentStatusEnum('status').notNull().default(AppointmentStatus.SCHEDULED),

  // Scheduling
  scheduledDate: timestamp('scheduled_date', { mode: 'date' }).notNull(),
  scheduledTime: varchar('scheduled_time', { length: 5 }).notNull(), // HH:mm format
  duration: integer('duration').notNull().default(30), // minutes

  // Details
  notes: text('notes'),
  reasonForVisit: text('reason_for_visit').notNull(),
  diagnosisCode: varchar('diagnosis_code', { length: 50 }),

  // Follow-up
  followUpRequired: boolean('follow_up_required').notNull().default(false),
  followUpDate: timestamp('follow_up_date', { mode: 'date' }),

  // Cancellation
  cancellationReason: text('cancellation_reason'),
  cancelledBy: uuid('cancelled_by').references(() => users.id),
  cancelledAt: timestamp('cancelled_at', { mode: 'date' }),

  // Audit fields
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull(),
  updatedBy: uuid('updated_by').notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
