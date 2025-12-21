import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MonitoringPlan,
  MonitoringPlanStatus,
} from '../entities/monitoring-plan.entity';
import { AppointmentsService } from '@modules/appointments/appointments.service';
import moment from 'moment';
import { ReasonForVisit } from '@repo/contracts';
import { Group8NoticesService } from '@modules/external/group8-notices/group8-notices.service';

@Injectable()
export class MonitoringPlanService {
  constructor(
    @InjectRepository(MonitoringPlan)
    private readonly repo: Repository<MonitoringPlan>,
    private readonly appointmentsService: AppointmentsService,
    private readonly group8NoticesService: Group8NoticesService,
  ) {}

  async getAvailableSlotsByTreatment(treatmentId: number) {
    const plans = await this.repo.find({
      where: { treatmentId },
      order: { sequence: 'ASC' },
      relations: ['treatment', 'treatment.initialDoctor'],
    });

    if (!plans.length) {
      throw new BadRequestException(
        'El tratamiento no tiene planes de monitoreo',
      );
    }

    const doctorId = plans[0].treatment.initialDoctor?.id;
    if (!doctorId) {
      throw new BadRequestException('El tratamiento no tiene médico asignado');
    }

    const results = [];

    for (const plan of plans) {
      if (!plan.minDate || !plan.maxDate) continue;

      const options = [];
      let cursor = moment(plan.minDate);
      const end = moment(plan.maxDate);

      while (cursor.isSameOrBefore(end, 'day')) {
        const dateStr = cursor.format('YYYY-MM-DD');

        const slots =
          await this.appointmentsService.getDoctorAvailableSlotsByDate(
            doctorId,
            dateStr,
          );

        if (slots.length > 0) {
          options.push({
            date: dateStr,
            slots: slots.map((s) => ({
              id: s.id,
              time: moment(s.dateTime).format('HH:mm'),
            })),
          });
        }

        cursor.add(1, 'day');
      }

      results.push({
        planId: plan.id,
        sequence: plan.sequence,
        plannedDay: plan.plannedDay,
        options,
      });
    }

    return results;
  }

  async create(data: Partial<MonitoringPlan>) {
    const plan = this.repo.create({
      ...data,
      status: MonitoringPlanStatus.PLANNED,
    });

    return this.repo.save(plan);
  }

  async findByTreatment(treatmentId: number) {
    return this.repo.find({
      where: { treatmentId },
      order: { sequence: 'ASC' },
    });
  }

  async update(id: number, data: Partial<MonitoringPlan>) {
    const plan = await this.repo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Monitoring plan not found');

    Object.assign(plan, data);
    return this.repo.save(plan);
  }

  async remove(id: number) {
    const plan = await this.repo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Monitoring plan not found');
    await this.repo.remove(plan);
  }

  async deleteByTreatment(treatmentId: number) {
    await this.repo.delete({ treatmentId });
  }

  async createOvertimeAppointment(planId: number) {
    const plan = await this.repo.findOne({
      where: { id: planId },
      relations: ['appointment', 'treatment', 'treatment.initialDoctor'],
    });

    if (!plan) throw new NotFoundException('Monitoring plan not found');

    if (plan.appointment) {
      return plan;
    }

    const appointment = await this.appointmentsService.createLocalAppointment({
      treatment: plan.treatment,
      doctor: plan.treatment.initialDoctor,
      externalId: `OVERTIME-${plan.id}-${Date.now()}`,
      isOvertime: true,
      reason: ReasonForVisit.StimulationMonitoring,
    });

    plan.appointment = appointment;
    plan.status = MonitoringPlanStatus.RESERVED;

    return this.repo.save(plan);
  }

  async assignExternalAppointment(planId: number, externalSlotId: number) {
    const plan = await this.repo.findOne({
      where: { id: planId },
      relations: [
        'treatment',
        'treatment.medicalHistory',
        'treatment.medicalHistory.patient',
        'treatment.initialDoctor',
      ],
    });

    if (!plan) throw new NotFoundException('Monitoring plan not found');

    const patient = plan.treatment.medicalHistory.patient;

    //  Reserva real en sistema externo
    await this.appointmentsService.reserveExternalSlotByDoctor({
      patientId: patient.id,
      externalSlotId,
    });

    //  Persistencia local
    const appointment = await this.appointmentsService.createLocalAppointment({
      treatment: plan.treatment,
      doctor: plan.treatment.initialDoctor,
      externalId: String(externalSlotId),
      isOvertime: false,
      reason: ReasonForVisit.StimulationMonitoring,
    });

    plan.appointment = appointment;
    plan.status = MonitoringPlanStatus.RESERVED;

    return this.repo.save(plan);
  }

  async sendMonitoringEmail(treatmentId: number) {
    const plans = await this.repo.find({
      where: { treatmentId },
      relations: [
        'treatment',
        'treatment.medicalHistory',
        'treatment.medicalHistory.patient',
        'treatment.initialDoctor',
      ],
      order: { sequence: 'ASC' },
    });

    const patient = plans[0].treatment.medicalHistory.patient;

    const htmlBody = `
    <h2>Monitoreos programados</h2>
    <ul>
      ${plans
        .map(
          (p) => `
        <li>
          Monitoreo #${p.sequence} –
          ${p.appointment?.isOvertime ? 'Sobreturno' : 'Turno reservado'}
        </li>
      `,
        )
        .join('')}
    </ul>
  `;

    await this.group8NoticesService.sendEmail({
      group: 8,
      toEmails: [patient.email],
      subject: 'Monitoreos de estimulación programados',
      htmlBody,
    });
  }

  async finalizeMonitoringPlans(params: {
    treatmentId: number;
    rows: {
      planId: number;
      selectedSlotId?: number;
      isOvertime: boolean;
    }[];
  }) {
    for (const row of params.rows) {
      if (row.isOvertime) {
        await this.createOvertimeAppointment(row.planId);
      } else if (row.selectedSlotId) {
        await this.assignExternalAppointment(row.planId, row.selectedSlotId);
      } else {
        throw new BadRequestException(
          `Plan ${row.planId} sin turno ni sobreturno`,
        );
      }
    }

    //  mail UNA sola vez 
    await this.sendMonitoringEmail(params.treatmentId);
  }
}
