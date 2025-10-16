import { eq } from 'drizzle-orm';
import type { Database } from '../client';
import { appointments, type NewAppointment } from '../schema';
import { AppointmentStatus } from '@repo/types';

/**
 * Appointment mutations
 */

export class AppointmentMutations {
  constructor(private db: Database) {}

  /**
   * Create a new appointment
   */
  async create(data: NewAppointment) {
    const [appointment] = await this.db
      .insert(appointments)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return appointment;
  }

  /**
   * Update appointment by ID
   */
  async update(id: string, data: Partial<NewAppointment>) {
    const [appointment] = await this.db
      .update(appointments)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id))
      .returning();
    return appointment || null;
  }

  /**
   * Delete appointment by ID
   */
  async delete(id: string) {
    await this.db.delete(appointments).where(eq(appointments.id, id));
  }

  /**
   * Update appointment status
   */
  async updateStatus(id: string, status: AppointmentStatus) {
    const [appointment] = await this.db
      .update(appointments)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id))
      .returning();
    return appointment || null;
  }

  /**
   * Cancel appointment
   */
  async cancel(id: string, cancelledBy: string, cancellationReason: string) {
    const [appointment] = await this.db
      .update(appointments)
      .set({
        status: AppointmentStatus.CANCELLED,
        cancelledBy,
        cancelledAt: new Date(),
        cancellationReason,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id))
      .returning();
    return appointment || null;
  }

  /**
   * Reschedule appointment
   */
  async reschedule(
    id: string,
    scheduledDate: Date,
    scheduledTime: string,
    updatedBy: string
  ) {
    const [appointment] = await this.db
      .update(appointments)
      .set({
        scheduledDate,
        scheduledTime,
        status: AppointmentStatus.RESCHEDULED,
        updatedBy,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id))
      .returning();
    return appointment || null;
  }

  /**
   * Confirm appointment
   */
  async confirm(id: string, updatedBy: string) {
    const [appointment] = await this.db
      .update(appointments)
      .set({
        status: AppointmentStatus.CONFIRMED,
        updatedBy,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id))
      .returning();
    return appointment || null;
  }

  /**
   * Complete appointment
   */
  async complete(
    id: string,
    updatedBy: string,
    data?: {
      diagnosisCode?: string;
      notes?: string;
      followUpRequired?: boolean;
      followUpDate?: Date;
    }
  ) {
    const [appointment] = await this.db
      .update(appointments)
      .set({
        status: AppointmentStatus.COMPLETED,
        updatedBy,
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id))
      .returning();
    return appointment || null;
  }
}
