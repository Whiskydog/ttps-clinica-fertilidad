import { eq, and, gte, lte, inArray } from 'drizzle-orm';
import type { Database } from '../client';
import { medicalRecords, users } from '../schema';
import { DocumentStatus, type MedicalRecordType, type DocumentStatus as DocumentStatusType } from '@repo/types';

/**
 * Medical Record queries
 */

export class MedicalRecordQueries {
  constructor(private db: Database) {}

  /**
   * Find medical record by ID
   */
  async findById(id: string) {
    const [record] = await this.db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.id, id))
      .limit(1);
    return record || null;
  }

  /**
   * Find medical record by ID with patient and doctor details
   */
  async findByIdWithDetails(id: string) {
    const result = await this.db
      .select({
        record: medicalRecords,
        patient: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(medicalRecords)
      .leftJoin(users, eq(medicalRecords.patientId, users.id))
      .where(eq(medicalRecords.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find medical records by patient ID
   */
  async findByPatientId(patientId: string) {
    return this.db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.patientId, patientId))
      .orderBy(medicalRecords.createdAt);
  }

  /**
   * Find medical records by doctor ID
   */
  async findByDoctorId(doctorId: string) {
    return this.db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.doctorId, doctorId))
      .orderBy(medicalRecords.createdAt);
  }

  /**
   * Find medical records by appointment ID
   */
  async findByAppointmentId(appointmentId: string) {
    return this.db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.appointmentId, appointmentId))
      .orderBy(medicalRecords.createdAt);
  }

  /**
   * Find medical records by type
   */
  async findByType(recordType: MedicalRecordType | MedicalRecordType[]) {
    const types = Array.isArray(recordType) ? recordType : [recordType];
    return this.db
      .select()
      .from(medicalRecords)
      .where(inArray(medicalRecords.recordType, types))
      .orderBy(medicalRecords.createdAt);
  }

  /**
   * Find medical records by status
   */
  async findByStatus(status: DocumentStatusType) {
    return this.db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.status, status))
      .orderBy(medicalRecords.createdAt);
  }

  /**
   * Find medical records by patient and date range
   */
  async findByPatientAndDateRange(patientId: string, startDate: Date, endDate: Date) {
    return this.db
      .select()
      .from(medicalRecords)
      .where(
        and(
          eq(medicalRecords.patientId, patientId),
          gte(medicalRecords.createdAt, startDate),
          lte(medicalRecords.createdAt, endDate)
        )
      )
      .orderBy(medicalRecords.createdAt);
  }

  /**
   * Get pending review records
   */
  async getPendingReview() {
    return this.db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.status, DocumentStatus.PENDING_REVIEW))
      .orderBy(medicalRecords.createdAt);
  }

  /**
   * Get records with attachments
   */
  async getRecordsWithAttachments(patientId: string) {
    const records = await this.db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.patientId, patientId));

    return records.filter((record) => record.attachments && record.attachments.length > 0);
  }
}
