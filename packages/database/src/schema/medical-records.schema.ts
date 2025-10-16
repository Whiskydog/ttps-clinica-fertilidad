import { pgTable, uuid, varchar, timestamp, text, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { MedicalRecordType, DocumentStatus } from '@repo/types';
import { users } from './users.schema';
import { appointments } from './appointments.schema';

/**
 * Enums for PostgreSQL
 */
export const medicalRecordTypeEnum = pgEnum('medical_record_type', [
  MedicalRecordType.CONSULTATION_NOTE,
  MedicalRecordType.PROCEDURE_NOTE,
  MedicalRecordType.LAB_RESULT,
  MedicalRecordType.IMAGING_REPORT,
  MedicalRecordType.PRESCRIPTION,
  MedicalRecordType.TREATMENT_PLAN,
  MedicalRecordType.CONSENT_FORM,
]);

export const documentStatusEnum = pgEnum('document_status', [
  DocumentStatus.DRAFT,
  DocumentStatus.PENDING_REVIEW,
  DocumentStatus.APPROVED,
  DocumentStatus.ARCHIVED,
]);

/**
 * Medical Records table schema
 */
export const medicalRecords = pgTable('medical_records', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Foreign keys
  patientId: uuid('patient_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  doctorId: uuid('doctor_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  appointmentId: uuid('appointment_id').references(() => appointments.id),

  // Record details
  recordType: medicalRecordTypeEnum('record_type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  status: documentStatusEnum('status').notNull().default(DocumentStatus.DRAFT),

  // Clinical data
  diagnosis: text('diagnosis'),
  treatment: text('treatment'),
  prescriptions: text('prescriptions'),
  labResults: text('lab_results'),

  // Document attachments (JSON array of attachment objects)
  attachments: jsonb('attachments').$type<
    Array<{
      id: string;
      fileName: string;
      fileSize: number;
      fileType: string;
      storagePath: string;
      uploadedAt: Date;
      uploadedBy: string;
    }>
  >().default([]),

  // Review and approval
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { mode: 'date' }),
  approvedBy: uuid('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at', { mode: 'date' }),

  // Audit fields
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull(),
  updatedBy: uuid('updated_by').notNull(),
});

export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type NewMedicalRecord = typeof medicalRecords.$inferInsert;
