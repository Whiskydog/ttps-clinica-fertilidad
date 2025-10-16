import { eq, and, gte, lte, inArray, or } from 'drizzle-orm';
import type { Database } from '../client';
import { appointments, users } from '../schema';
import { AppointmentStatus, type AppointmentType } from '@repo/types';

/**
 * Appointment queries
 */

export class AppointmentQueries {
  constructor(private db: Database) {}

  /**
   * Find appointment by ID
   */
  async findById(id: string) {
    const [appointment] = await this.db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id))
      .limit(1);
    return appointment || null;
  }

  /**
   * Find appointment by ID with patient and doctor details
   */
  async findByIdWithDetails(id: string) {
    const result = await this.db
      .select({
        appointment: appointments,
        patient: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
        },
      })
      .from(appointments)
      .leftJoin(users, eq(appointments.patientId, users.id))
      .where(eq(appointments.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find appointments by patient ID
   */
  async findByPatientId(patientId: string) {
    return this.db
      .select()
      .from(appointments)
      .where(eq(appointments.patientId, patientId))
      .orderBy(appointments.scheduledDate);
  }

  /**
   * Find appointments by doctor ID
   */
  async findByDoctorId(doctorId: string) {
    return this.db
      .select()
      .from(appointments)
      .where(eq(appointments.doctorId, doctorId))
      .orderBy(appointments.scheduledDate);
  }

  /**
   * Find appointments by status
   */
  async findByStatus(status: AppointmentStatus | AppointmentStatus[]) {
    const statuses = Array.isArray(status) ? status : [status];
    return this.db
      .select()
      .from(appointments)
      .where(inArray(appointments.status, statuses))
      .orderBy(appointments.scheduledDate);
  }

  /**
   * Find appointments by date range
   */
  async findByDateRange(startDate: Date, endDate: Date) {
    return this.db
      .select()
      .from(appointments)
      .where(
        and(
          gte(appointments.scheduledDate, startDate),
          lte(appointments.scheduledDate, endDate)
        )
      )
      .orderBy(appointments.scheduledDate);
  }

  /**
   * Find appointments by doctor and date range
   */
  async findByDoctorAndDateRange(doctorId: string, startDate: Date, endDate: Date) {
    return this.db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, doctorId),
          gte(appointments.scheduledDate, startDate),
          lte(appointments.scheduledDate, endDate)
        )
      )
      .orderBy(appointments.scheduledDate);
  }

  /**
   * Check for appointment conflicts
   */
  async checkConflict(
    doctorId: string,
    scheduledDate: Date,
    scheduledTime: string,
    duration: number,
    excludeAppointmentId?: string
  ) {
    const query = this.db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, doctorId),
          eq(appointments.scheduledDate, scheduledDate),
          inArray(appointments.status, [
            AppointmentStatus.SCHEDULED,
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.IN_PROGRESS,
          ])
        )
      );

    const existingAppointments = await query;

    // Filter out the appointment being updated if excludeAppointmentId is provided
    const conflicts = existingAppointments.filter((apt) => {
      if (excludeAppointmentId && apt.id === excludeAppointmentId) {
        return false;
      }

      // Simple time conflict check (would need more sophisticated logic in production)
      return apt.scheduledTime === scheduledTime;
    });

    return conflicts.length > 0;
  }

  /**
   * Get upcoming appointments for a patient
   */
  async getUpcomingByPatient(patientId: string) {
    return this.db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.patientId, patientId),
          gte(appointments.scheduledDate, new Date()),
          inArray(appointments.status, [
            AppointmentStatus.SCHEDULED,
            AppointmentStatus.CONFIRMED,
          ])
        )
      )
      .orderBy(appointments.scheduledDate)
      .limit(10);
  }

  /**
   * Get today's appointments for a doctor
   */
  async getTodayByDoctor(doctorId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, doctorId),
          gte(appointments.scheduledDate, today),
          lte(appointments.scheduledDate, tomorrow)
        )
      )
      .orderBy(appointments.scheduledTime);
  }
}
