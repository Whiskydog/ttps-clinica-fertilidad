import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TreatmentService } from '../treatments/treatment.service';
import { Group10TelegramBotService } from '@external/group10-telegram-bot/group10-telegram-bot.service';
import { Group8NoticesService } from '@external/group8-notices/group8-notices.service';

@Injectable()
export class TreatmentSchedulerService {
  private readonly logger = new Logger(TreatmentSchedulerService.name);

  constructor(
    private readonly treatmentService: TreatmentService,
    private readonly telegramService: Group10TelegramBotService,
    private readonly emailService: Group8NoticesService,
  ) {}

  /**
   * Cron job que se ejecuta diariamente a medianoche
   * Revisa tratamientos inactivos y:
   * - Envía advertencia si llevan 50-59 días sin actividad
   * - Cierra automáticamente si llevan 60+ días sin actividad
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkInactiveTreatments() {
    this.logger.log('Iniciando revisión de tratamientos inactivos...');

    try {
      const activeTreatments = await this.treatmentService.findAllActive();
      this.logger.log(`Encontrados ${activeTreatments.length} tratamientos vigentes`);

      const now = new Date();
      let warningCount = 0;
      let closedCount = 0;

      const WARNING_THRESHOLD_DAYS = 50;
      const CLOSE_THRESHOLD_DAYS = 60;

      for (const treatment of activeTreatments) {
        const lastActivity = await this.treatmentService.getLastActivityDate(treatment.id);

        if (!lastActivity) {
          this.logger.warn(`Tratamiento ${treatment.id} sin fecha de actividad registrada`);
          continue;
        }

        const daysSinceActivity = Math.floor(
          (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
        );

        // Si lleva 60+ días sin actividad: cerrar
        if (daysSinceActivity >= CLOSE_THRESHOLD_DAYS) {
          await this.closeTreatmentByInactivity(treatment, daysSinceActivity);
          closedCount++;
        }
        // Si lleva 50-59 días sin actividad: advertir
        else if (daysSinceActivity >= WARNING_THRESHOLD_DAYS) {
          await this.sendInactivityWarning(treatment, daysSinceActivity);
          warningCount++;
        }
      }

      this.logger.log(
        `Revisión completada: ${warningCount} advertencias enviadas, ${closedCount} tratamientos cerrados`,
      );
    } catch (error) {
      this.logger.error('Error en revisión de tratamientos inactivos', error);
    }
  }

  /**
   * Envía advertencia de inactividad a paciente y doctor
   */
  private async sendInactivityWarning(treatment: any, daysSinceActivity: number) {
    const daysRemaining = 60 - daysSinceActivity;
    const patientName = `${treatment.medicalHistory?.patient?.firstName} ${treatment.medicalHistory?.patient?.lastName}`;
    const doctorName = treatment.initialDoctor
      ? `${treatment.initialDoctor.firstName} ${treatment.initialDoctor.lastName}`
      : 'Sin médico asignado';

    this.logger.warn(
      `[ADVERTENCIA] Tratamiento ${treatment.id} - Paciente: ${patientName} - ` +
        `${daysSinceActivity} días sin actividad - Se cerrará en ${daysRemaining} días`,
    );

    // Enviar notificaciones al paciente
    const patientEmail = treatment.medicalHistory?.patient?.email;
    if (patientEmail) {
      try {
        await this.emailService.sendEmail({
          group: 9,
          toEmails: [patientEmail],
          subject: 'Aviso de inactividad de tratamiento',
          htmlBody: `
            <h2>Aviso de inactividad de tratamiento</h2>
            <p>Estimado/a ${patientName},</p>
            <p>Su tratamiento será cerrado automáticamente en <strong>${daysRemaining} días</strong> por inactividad.</p>
            <p>Por favor, contacte a su médico si desea continuar con el tratamiento.</p>
            <p>Saludos cordiales,<br>Clínica de Fertilidad</p>
          `,
        });
        this.logger.log(`Email de advertencia enviado al paciente: ${patientEmail}`);
      } catch (error) {
        this.logger.error(`Error enviando email al paciente ${patientEmail}:`, error);
      }
    }

    // Enviar alerta a Telegram
    try {
      await this.telegramService.sendAlert({
        text: `⚠️ ADVERTENCIA: Tratamiento ${treatment.id} del paciente ${patientName} será cerrado en ${daysRemaining} días por inactividad.`,
      });
    } catch (error) {
      this.logger.error('Error enviando alerta a Telegram:', error);
    }

    // Enviar notificación al doctor
    const doctorEmail = treatment.initialDoctor?.email;
    if (doctorEmail) {
      try {
        await this.emailService.sendEmail({
          group: 9,
          toEmails: [doctorEmail],
          subject: 'Aviso de tratamiento por cerrar',
          htmlBody: `
            <h2>Aviso de tratamiento por cerrar</h2>
            <p>Estimado/a Dr/a. ${doctorName},</p>
            <p>El tratamiento del paciente <strong>${patientName}</strong> será cerrado en <strong>${daysRemaining} días</strong> por inactividad.</p>
            <p>Por favor, contacte al paciente si considera necesario continuar con el tratamiento.</p>
            <p>ID Tratamiento: ${treatment.id}</p>
          `,
        });
        this.logger.log(`Email de advertencia enviado al doctor: ${doctorEmail}`);
      } catch (error) {
        this.logger.error(`Error enviando email al doctor ${doctorEmail}:`, error);
      }
    }
  }

  /**
   * Cierra un tratamiento por inactividad y notifica
   */
  private async closeTreatmentByInactivity(treatment: any, daysSinceActivity: number) {
    const patientName = `${treatment.medicalHistory?.patient?.firstName} ${treatment.medicalHistory?.patient?.lastName}`;
    const doctorName = treatment.initialDoctor
      ? `${treatment.initialDoctor.firstName} ${treatment.initialDoctor.lastName}`
      : 'Sin médico asignado';

    // Cerrar el tratamiento
    await this.treatmentService.closeTreatmentByInactivity(treatment.id);

    this.logger.log(
      `[CIERRE AUTOMÁTICO] Tratamiento ${treatment.id} cerrado - ` +
        `Paciente: ${patientName} - Doctor: ${doctorName} - ` +
        `${daysSinceActivity} días sin actividad`,
    );

    // Enviar notificación de cierre al paciente por email
    const patientEmail = treatment.medicalHistory?.patient?.email;
    if (patientEmail) {
      try {
        await this.emailService.sendEmail({
          group: 9,
          toEmails: [patientEmail],
          subject: 'Tratamiento cerrado por inactividad',
          htmlBody: `
            <h2>Tratamiento cerrado por inactividad</h2>
            <p>Estimado/a ${patientName},</p>
            <p>Su tratamiento ha sido cerrado automáticamente debido a <strong>${daysSinceActivity} días de inactividad</strong>.</p>
            <p>Si desea reabrir el tratamiento, por favor contacte a su médico.</p>
            <p>Saludos cordiales,<br>Clínica de Fertilidad</p>
          `,
        });
        this.logger.log(`Email de cierre enviado al paciente: ${patientEmail}`);
      } catch (error) {
        this.logger.error(`Error enviando email de cierre al paciente ${patientEmail}:`, error);
      }
    }

    // Enviar alerta de cierre a Telegram
    try {
      await this.telegramService.sendAlert({
        text: `🔴 CIERRE AUTOMÁTICO: Tratamiento ${treatment.id} del paciente ${patientName} ha sido cerrado por ${daysSinceActivity} días de inactividad.`,
      });
    } catch (error) {
      this.logger.error('Error enviando alerta de cierre a Telegram:', error);
    }

    // Enviar notificación de cierre al doctor por email
    const doctorEmail = treatment.initialDoctor?.email;
    if (doctorEmail) {
      try {
        await this.emailService.sendEmail({
          group: 9,
          toEmails: [doctorEmail],
          subject: 'Tratamiento cerrado automáticamente',
          htmlBody: `
            <h2>Tratamiento cerrado automáticamente</h2>
            <p>Estimado/a Dr/a. ${doctorName},</p>
            <p>El tratamiento del paciente <strong>${patientName}</strong> ha sido cerrado automáticamente por <strong>${daysSinceActivity} días de inactividad</strong>.</p>
            <p>Si considera necesario reabrir el tratamiento, puede hacerlo desde el sistema.</p>
            <p>ID Tratamiento: ${treatment.id}</p>
          `,
        });
        this.logger.log(`Email de cierre enviado al doctor: ${doctorEmail}`);
      } catch (error) {
        this.logger.error(`Error enviando email de cierre al doctor ${doctorEmail}:`, error);
      }
    }
  }
}
