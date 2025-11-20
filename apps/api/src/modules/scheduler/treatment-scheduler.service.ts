import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TreatmentService } from '../treatments/treatment.service';

@Injectable()
export class TreatmentSchedulerService {
  private readonly logger = new Logger(TreatmentSchedulerService.name);

  constructor(private readonly treatmentService: TreatmentService) {}

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

    // TODO: Integrar con módulo de Notificaciones cuando esté disponible
    // Enviar notificación al paciente:
    // await this.notificationsService.send({
    //   userId: treatment.medicalHistory.patient.id,
    //   type: 'treatment_inactivity_warning',
    //   title: 'Aviso de inactividad de tratamiento',
    //   message: `Su tratamiento será cerrado automáticamente en ${daysRemaining} días por inactividad. ` +
    //            `Por favor, contacte a su médico si desea continuar con el tratamiento.`,
    //   channel: 'all',
    //   metadata: { treatmentId: treatment.id, daysRemaining }
    // });

    // TODO: Enviar notificación al doctor:
    // await this.notificationsService.send({
    //   userId: treatment.initialDoctor?.id,
    //   type: 'treatment_inactivity_warning',
    //   title: 'Aviso de tratamiento por cerrar',
    //   message: `El tratamiento del paciente ${patientName} será cerrado en ${daysRemaining} días por inactividad.`,
    //   channel: 'email',
    //   metadata: { treatmentId: treatment.id, patientId: treatment.medicalHistory.patient.id }
    // });
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

    // TODO: Integrar con módulo de Notificaciones cuando esté disponible
    // Enviar notificación de cierre al paciente:
    // await this.notificationsService.send({
    //   userId: treatment.medicalHistory.patient.id,
    //   type: 'treatment_closed_inactivity',
    //   title: 'Tratamiento cerrado por inactividad',
    //   message: `Su tratamiento ha sido cerrado automáticamente debido a ${daysSinceActivity} días de inactividad. ` +
    //            `Si desea reabrir el tratamiento, por favor contacte a su médico.`,
    //   channel: 'all',
    //   metadata: { treatmentId: treatment.id }
    // });

    // TODO: Enviar notificación de cierre al doctor:
    // await this.notificationsService.send({
    //   userId: treatment.initialDoctor?.id,
    //   type: 'treatment_closed_inactivity',
    //   title: 'Tratamiento cerrado automáticamente',
    //   message: `El tratamiento del paciente ${patientName} ha sido cerrado por ${daysSinceActivity} días de inactividad.`,
    //   channel: 'email',
    //   metadata: { treatmentId: treatment.id, patientId: treatment.medicalHistory.patient.id }
    // });
  }
}
