import { eq } from 'drizzle-orm';
import type { Database } from '../client';
import { medicalRecords, type NewMedicalRecord } from '../schema';
import { DocumentStatus, type MedicalRecordAttachment } from '@repo/types';

/**
 * Medical Record mutations
 */

export class MedicalRecordMutations {
  constructor(private db: Database) {}

  /**
   * Create a new medical record
   */
  async create(data: NewMedicalRecord) {
    const [record] = await this.db
      .insert(medicalRecords)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return record;
  }

  /**
   * Update medical record by ID
   */
  async update(id: string, data: Partial<NewMedicalRecord>) {
    const [record] = await this.db
      .update(medicalRecords)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(medicalRecords.id, id))
      .returning();
    return record || null;
  }

  /**
   * Delete medical record by ID
   */
  async delete(id: string) {
    await this.db.delete(medicalRecords).where(eq(medicalRecords.id, id));
  }

  /**
   * Update medical record status
   */
  async updateStatus(id: string, status: DocumentStatus, updatedBy: string) {
    const [record] = await this.db
      .update(medicalRecords)
      .set({
        status,
        updatedBy,
        updatedAt: new Date(),
      })
      .where(eq(medicalRecords.id, id))
      .returning();
    return record || null;
  }

  /**
   * Add attachment to medical record
   */
  async addAttachment(id: string, attachment: MedicalRecordAttachment) {
    // First, get the current record
    const [currentRecord] = await this.db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.id, id))
      .limit(1);

    if (!currentRecord) {
      return null;
    }

    const currentAttachments = (currentRecord.attachments || []) as MedicalRecordAttachment[];
    const updatedAttachments = [...currentAttachments, attachment];

    const [record] = await this.db
      .update(medicalRecords)
      .set({
        attachments: updatedAttachments,
        updatedAt: new Date(),
      })
      .where(eq(medicalRecords.id, id))
      .returning();

    return record || null;
  }

  /**
   * Remove attachment from medical record
   */
  async removeAttachment(id: string, attachmentId: string) {
    // First, get the current record
    const [currentRecord] = await this.db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.id, id))
      .limit(1);

    if (!currentRecord) {
      return null;
    }

    const currentAttachments = (currentRecord.attachments || []) as MedicalRecordAttachment[];
    const updatedAttachments = currentAttachments.filter((att) => att.id !== attachmentId);

    const [record] = await this.db
      .update(medicalRecords)
      .set({
        attachments: updatedAttachments,
        updatedAt: new Date(),
      })
      .where(eq(medicalRecords.id, id))
      .returning();

    return record || null;
  }

  /**
   * Review medical record
   */
  async review(id: string, reviewedBy: string) {
    const [record] = await this.db
      .update(medicalRecords)
      .set({
        reviewedBy,
        reviewedAt: new Date(),
        status: DocumentStatus.PENDING_REVIEW,
        updatedAt: new Date(),
      })
      .where(eq(medicalRecords.id, id))
      .returning();
    return record || null;
  }

  /**
   * Approve medical record
   */
  async approve(id: string, approvedBy: string) {
    const [record] = await this.db
      .update(medicalRecords)
      .set({
        approvedBy,
        approvedAt: new Date(),
        status: DocumentStatus.APPROVED,
        updatedAt: new Date(),
      })
      .where(eq(medicalRecords.id, id))
      .returning();
    return record || null;
  }

  /**
   * Archive medical record
   */
  async archive(id: string, updatedBy: string) {
    const [record] = await this.db
      .update(medicalRecords)
      .set({
        status: DocumentStatus.ARCHIVED,
        updatedBy,
        updatedAt: new Date(),
      })
      .where(eq(medicalRecords.id, id))
      .returning();
    return record || null;
  }
}
