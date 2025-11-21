import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull } from 'typeorm';
import { Treatment } from '../treatments/entities/treatment.entity';
import { Monitoring } from '../treatments/entities/monitoring.entity';
import { PostTransferMilestone } from '../treatments/entities/post-transfer-milestone.entity';
import { InformedConsent } from '../treatments/entities/informed-consent.entity';
import { MedicalOrder } from '../medical-orders/entities/medical-order.entity';
import { PunctureRecord } from '../laboratory/entities/puncture-record.entity';
import { Embryo } from '../laboratory/entities/embryo.entity';
import { Oocyte } from '../laboratory/entities/oocyte.entity';
import {
  TreatmentStatus,
  MilestoneType,
  MilestoneResult,
  DashboardKPIs,
  MonthlyStats,
  DoctorAlert,
  RecentTreatment,
  TodayAppointment,
} from '@repo/contracts';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Treatment)
    private readonly treatmentRepo: Repository<Treatment>,
    @InjectRepository(Monitoring)
    private readonly monitoringRepo: Repository<Monitoring>,
    @InjectRepository(PostTransferMilestone)
    private readonly milestoneRepo: Repository<PostTransferMilestone>,
    @InjectRepository(InformedConsent)
    private readonly consentRepo: Repository<InformedConsent>,
    @InjectRepository(MedicalOrder)
    private readonly medicalOrderRepo: Repository<MedicalOrder>,
    @InjectRepository(PunctureRecord)
    private readonly punctureRepo: Repository<PunctureRecord>,
    @InjectRepository(Embryo)
    private readonly embryoRepo: Repository<Embryo>,
    @InjectRepository(Oocyte)
    private readonly oocyteRepo: Repository<Oocyte>,
  ) {}

  async getDashboardKPIs(doctorId: number): Promise<DashboardKPIs> {
    // 1. Pacientes activos: pacientes con tratamientos vigentes del doctor
    const activePatients = await this.treatmentRepo
      .createQueryBuilder('t')
      .innerJoin('t.medicalHistory', 'mh')
      .where('t.initialDoctor.id = :doctorId', { doctorId })
      .andWhere('t.status = :status', { status: TreatmentStatus.vigente })
      .select('COUNT(DISTINCT mh.patient)', 'count')
      .getRawOne();

    // 2. Turnos de hoy
    // TODO: Integración con módulo de Appointments externo
    // Usar AppointmentsService para obtener turnos del día del doctor
    // Endpoint esperado del servicio externo: GET con doctor_id y fecha
    const todayAppointments = 0;

    // 3. Monitoreos activos: tratamientos con monitoreos en últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeMonitorings = await this.monitoringRepo
      .createQueryBuilder('m')
      .innerJoin('m.treatment', 't')
      .where('t.initialDoctor.id = :doctorId', { doctorId })
      .andWhere('t.status = :status', { status: TreatmentStatus.vigente })
      .andWhere('m.monitoringDate >= :date', { date: thirtyDaysAgo })
      .select('COUNT(DISTINCT t.id)', 'count')
      .getRawOne();

    // 4. Resultados pendientes: órdenes médicas pendientes
    const pendingResults = await this.medicalOrderRepo
      .createQueryBuilder('mo')
      .where('mo.doctor.id = :doctorId', { doctorId })
      .andWhere('mo.status = :status', { status: 'pending' })
      .getCount();

    return {
      activePatients: Number(activePatients?.count) || 0,
      todayAppointments,
      activeMonitorings: Number(activeMonitorings?.count) || 0,
      pendingResults,
    };
  }

  async getMonthlyStats(doctorId: number): Promise<MonthlyStats> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    // 1. Tratamientos iniciados este mes
    const treatmentsStarted = await this.treatmentRepo.count({
      where: {
        initialDoctor: { id: doctorId },
        startDate: Between(startOfMonth, endOfMonth),
      },
    });

    // 2. Procedimientos (punciones) realizados
    const proceduresPerformed = await this.punctureRepo
      .createQueryBuilder('p')
      .innerJoin('p.treatment', 't')
      .where('t.initialDoctor.id = :doctorId', { doctorId })
      .andWhere('p.punctureDateTime BETWEEN :start AND :end', {
        start: startOfMonth,
        end: endOfMonth,
      })
      .getCount();

    // 3. Transferencias
    // TODO: Investigar cómo se registran las transferencias de embriones
    // Verificar si existe entidad Transfer o si se registra como:
    // - Campo en Embryo (final_disposition = 'transferred')
    // - Milestone específico en PostTransferMilestone
    const transfers = 0;

    // 4. Betas positivas del mes
    const positiveBetas = await this.milestoneRepo
      .createQueryBuilder('m')
      .innerJoin('m.treatment', 't')
      .where('t.initialDoctor.id = :doctorId', { doctorId })
      .andWhere('m.milestoneType = :type', { type: MilestoneType.beta_test })
      .andWhere('m.result = :result', { result: MilestoneResult.positive })
      .andWhere('m.milestoneDate BETWEEN :start AND :end', {
        start: startOfMonth,
        end: endOfMonth,
      })
      .getCount();

    // 5. Total betas para calcular tasa
    const totalBetas = await this.milestoneRepo
      .createQueryBuilder('m')
      .innerJoin('m.treatment', 't')
      .where('t.initialDoctor.id = :doctorId', { doctorId })
      .andWhere('m.milestoneType = :type', { type: MilestoneType.beta_test })
      .andWhere('m.milestoneDate BETWEEN :start AND :end', {
        start: startOfMonth,
        end: endOfMonth,
      })
      .getCount();

    // 6. Embriones criopreservados
    const cryoEmbryos = await this.embryoRepo
      .createQueryBuilder('e')
      .innerJoin('e.oocyteOrigin', 'o')
      .innerJoin('o.puncture', 'p')
      .innerJoin('p.treatment', 't')
      .where('t.initialDoctor.id = :doctorId', { doctorId })
      .andWhere('e.finalDisposition = :disposition', {
        disposition: 'cryopreserved',
      })
      .andWhere('e.fertilizationDate BETWEEN :start AND :end', {
        start: startOfMonth,
        end: endOfMonth,
      })
      .getCount();

    // 7. Tasa de fecundación
    const totalOocytesMature = await this.oocyteRepo
      .createQueryBuilder('o')
      .innerJoin('o.puncture', 'p')
      .innerJoin('p.treatment', 't')
      .where('t.initialDoctor.id = :doctorId', { doctorId })
      .andWhere('o.currentState = :maturity', { maturity: 'mature' })
      .andWhere('o.createdAt BETWEEN :start AND :end', {
        start: startOfMonth,
        end: endOfMonth,
      })
      .getCount();

    const totalEmbryos = await this.embryoRepo
      .createQueryBuilder('e')
      .innerJoin('e.oocyteOrigin', 'o')
      .innerJoin('o.puncture', 'p')
      .innerJoin('p.treatment', 't')
      .where('t.initialDoctor.id = :doctorId', { doctorId })
      .andWhere('e.fertilizationDate BETWEEN :start AND :end', {
        start: startOfMonth,
        end: endOfMonth,
      })
      .getCount();

    return {
      treatmentsStarted,
      proceduresPerformed,
      transfers,
      positiveBetas,
      positiveRate: totalBetas > 0 ? Math.round((positiveBetas / totalBetas) * 100) : 0,
      cryoEmbryos,
      fecundationRate:
        totalOocytesMature > 0
          ? Math.round((totalEmbryos / totalOocytesMature) * 100)
          : 0,
    };
  }

  async getDashboardAlerts(doctorId: number): Promise<DoctorAlert[]> {
    const alerts: DoctorAlert[] = [];
    let alertId = 1;

    // 1. Betas positivas sin confirmación de saco
    const positiveBetasWithoutSac = await this.milestoneRepo
      .createQueryBuilder('m')
      .innerJoin('m.treatment', 't')
      .innerJoin('t.medicalHistory', 'mh')
      .innerJoin('mh.patient', 'p')
      .where('t.initialDoctor.id = :doctorId', { doctorId })
      .andWhere('m.milestoneType = :type', { type: MilestoneType.beta_test })
      .andWhere('m.result = :result', { result: MilestoneResult.positive })
      .select([
        'm.id',
        'm.createdAt',
        't.id',
        'p.id',
        'p.firstName',
        'p.lastName',
      ])
      .getMany();

    for (const beta of positiveBetasWithoutSac) {
      const hasSac = await this.milestoneRepo.findOne({
        where: {
          treatment: { id: beta.treatment.id },
          milestoneType: MilestoneType.sac_present,
        },
      });

      if (!hasSac) {
        const patient = beta.treatment.medicalHistory.patient;
        alerts.push({
          id: alertId++,
          type: 'urgent',
          title: 'Beta positiva',
          message: 'Confirmar con ecografía',
          patientId: patient.id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          treatmentId: beta.treatment.id,
          createdAt: beta.createdAt.toISOString(),
        });
      }
    }

    // 2. Consentimientos pendientes de firma
    const treatmentsWithoutConsent = await this.treatmentRepo
      .createQueryBuilder('t')
      .innerJoin('t.medicalHistory', 'mh')
      .innerJoin('mh.patient', 'p')
      .leftJoin('t.informedConsent', 'ic')
      .where('t.initialDoctor.id = :doctorId', { doctorId })
      .andWhere('t.status = :status', { status: TreatmentStatus.vigente })
      .andWhere('ic.id IS NULL')
      .select(['t.id', 't.createdAt', 'p.id', 'p.firstName', 'p.lastName'])
      .getMany();

    for (const treatment of treatmentsWithoutConsent) {
      const patient = treatment.medicalHistory.patient;
      alerts.push({
        id: alertId++,
        type: 'warning',
        title: 'Consentimiento pendiente',
        message: 'Firma de documentación requerida',
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        treatmentId: treatment.id,
        createdAt: treatment.createdAt.toISOString(),
      });
    }

    // 3. Resultados listos para revisar
    const completedOrders = await this.medicalOrderRepo
      .createQueryBuilder('mo')
      .innerJoin('mo.patient', 'p')
      .where('mo.doctor.id = :doctorId', { doctorId })
      .andWhere('mo.status = :status', { status: 'completed' })
      .select(['mo.id', 'mo.createdAt', 'p.id', 'p.firstName', 'p.lastName'])
      .orderBy('mo.createdAt', 'DESC')
      .take(10)
      .getMany();

    for (const order of completedOrders) {
      alerts.push({
        id: alertId++,
        type: 'info',
        title: 'Resultado listo',
        message: 'Revisar resultado de estudio',
        patientId: order.patient.id,
        patientName: `${order.patient.firstName} ${order.patient.lastName}`,
        createdAt: order.createdAt.toISOString(),
      });
    }

    // Ordenar por fecha descendente
    return alerts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async getRecentTreatments(
    doctorId: number,
    limit = 5,
  ): Promise<RecentTreatment[]> {
    const treatments = await this.treatmentRepo.find({
      where: {
        initialDoctor: { id: doctorId },
      },
      relations: ['medicalHistory', 'medicalHistory.patient'],
      order: {
        updatedAt: 'DESC',
      },
      take: limit,
    });

    return treatments.map((t) => ({
      id: t.id,
      patientId: t.medicalHistory.patient.id,
      patientName: `${t.medicalHistory.patient.firstName} ${t.medicalHistory.patient.lastName}`,
      status: this.getTreatmentStatusLabel(t.status),
      lastMovement: this.getLastMovementDescription(t),
      lastMovementDate: t.updatedAt.toISOString(),
    }));
  }

  async getTodayAppointments(doctorId: number): Promise<TodayAppointment[]> {
    // TODO: Integración con módulo de Appointments externo
    // Usar AppointmentsService para obtener turnos del día
    // Este método debería llamar al servicio de appointments y transformar la respuesta
    // Endpoint esperado: GET /appointments/doctor/:doctorId/today
    // Por ahora retornamos array vacío hasta que se integre el módulo
    return [];
  }

  private getTreatmentStatusLabel(status: TreatmentStatus): string {
    const labels: Record<TreatmentStatus, string> = {
      [TreatmentStatus.vigente]: 'En curso',
      [TreatmentStatus.closed]: 'Cerrado',
      [TreatmentStatus.completed]: 'Completado',
    };
    return labels[status] || status;
  }

  private getLastMovementDescription(treatment: Treatment): string {
    // Determinar el último movimiento basado en el estado
    switch (treatment.status) {
      case TreatmentStatus.vigente:
        return 'En tratamiento activo';
      case TreatmentStatus.completed:
        return 'Tratamiento exitoso';
      case TreatmentStatus.closed:
        return treatment.closureReason || 'Cerrado';
      default:
        return 'Actualizado';
    }
  }
}
