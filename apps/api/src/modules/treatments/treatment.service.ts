
import { MedicalHistoryService } from '@modules/medical-history/services/medical-history.service';

import { PaymentsService } from '@modules/payments/payments.service';
import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DoctorNote } from './entities/doctor-note.entity';
import { MedicationProtocol } from './entities/medication-protocol.entity';
import { Monitoring } from './entities/monitoring.entity';
import { PostTransferMilestone } from './entities/post-transfer-milestone.entity';
import { MedicalOrder } from '../medical-orders/entities/medical-order.entity';
import { PunctureRecord } from '../laboratory/entities/puncture-record.entity';
import { TreatmentStatus, InitialObjective } from '@repo/contracts';
import { MedicalHistory } from '../medical-history/entities/medical-history.entity';
import { CreateTreatmentDto, UpdateTreatmentDto } from './dto';
import { parseDateFromString } from '@common/utils/date.utils';
import { MonitoringPlanService } from './services/monitoring-plan.service';
import {
  MonitoringPlan,
  MonitoringPlanStatus,
} from './entities/monitoring-plan.entity';
import { CreateMonitoringDto } from './dto/create-monitoring.dto';
import { Treatment } from './entities/treatment.entity';
import { OocyteState } from '@repo/contracts';
import { Oocyte } from '../laboratory/entities/oocyte.entity';

@Injectable()
export class TreatmentService {
  constructor(
    @InjectRepository(Treatment)
    private readonly treatmentRepo: Repository<Treatment>,
    @InjectRepository(Monitoring)
    private readonly monitoringRepo: Repository<Monitoring>,
    @InjectRepository(MonitoringPlan)
    private readonly monitoringPlanRepo: Repository<MonitoringPlan>,
    @InjectRepository(DoctorNote)
    private readonly doctorNoteRepo: Repository<DoctorNote>,
    @InjectRepository(MedicationProtocol)
    private readonly medicationProtocolRepo: Repository<MedicationProtocol>,
    @InjectRepository(PostTransferMilestone)
    private readonly milestoneRepo: Repository<PostTransferMilestone>,
    @InjectRepository(MedicalOrder)
    private readonly medicalOrderRepo: Repository<MedicalOrder>,
    @InjectRepository(PunctureRecord)
    private readonly punctureRepo: Repository<PunctureRecord>,
    private readonly monitoringPlanService: MonitoringPlanService,
    private readonly paymentsService: PaymentsService,
    private readonly medicalHistoryService: MedicalHistoryService,
    @InjectRepository(Oocyte)
    private readonly oocyteRepo: Repository<Oocyte>,
    @InjectRepository(MedicalHistory)
    private readonly medicalHistoryRepo: Repository<MedicalHistory>,
  ) { }

  async createTreatment(
    medicalHistory: MedicalHistory,
    dto: CreateTreatmentDto,
    doctorId: number,
  ) {
    const initialObjective = (dto as any).initial_objective as InitialObjective;

    const treatment = this.treatmentRepo.create({
      initialObjective,
      startDate: new Date(),
      initialDoctor: { id: Number(doctorId) },
      status: TreatmentStatus.vigente,
      closureReason: null,
      closureDate: null,
      medicalHistory,
    });
    const saved = await this.treatmentRepo.save(treatment);
    medicalHistory.currentTreatment = saved;
    await this.medicalHistoryService.save(medicalHistory);

    await this.paymentsService.registerPaymentOrder(
      saved.id,
      medicalHistory.patient.id,
      medicalHistory.patient.medicalInsurance.externalId,
    );

    const medicalOrderIds = (dto as any).medicalOrderIds;
    console.log('[DEBUG] createTreatment receive dto:', JSON.stringify(dto));
    console.log('[DEBUG] medicalOrderIds:', medicalOrderIds);
    if (medicalOrderIds && Array.isArray(medicalOrderIds) && medicalOrderIds.length > 0) {
      const updateResult = await this.medicalOrderRepo.update(
        { id: In(medicalOrderIds) },
        { treatmentId: saved.id },
      );
      console.log('[DEBUG] medicalOrderRepo.update result:', updateResult);
    }

    return saved;
  }

  async findByMedicalHistoryId(medicalHistoryId: number) {
    return this.treatmentRepo.find({
      where: { medicalHistory: { id: medicalHistoryId } },
    });
  }

  async update(id: number, dto: UpdateTreatmentDto): Promise<Treatment> {
    const treatment = await this.treatmentRepo.findOne({
      where: { id },
      relations: ['medicalHistory'],
    });

    if (!treatment) {
      throw new NotFoundException('Tratamiento no encontrado');
    }

    if (dto.initialObjective !== undefined) {
      treatment.initialObjective = dto.initialObjective as InitialObjective;
    }
    if (dto.startDate !== undefined) {
      treatment.startDate = parseDateFromString(dto.startDate);
    }
    if (dto.status !== undefined) {
      if (dto.status === TreatmentStatus.closed && treatment.status !== TreatmentStatus.closed) {
        const pendingOocytes = await this.oocyteRepo.find({
          where: {
            puncture: { treatment: { id: treatment.id } },
          },
        });
        const hasActiveOocytes = pendingOocytes.some(
          (o) =>
            !o.isCryopreserved &&
            o.currentState !== OocyteState.USED &&
            o.currentState !== OocyteState.DISCARDED,
        );
        if (hasActiveOocytes) {
          throw new BadRequestException(
            'No se puede cerrar el tratamiento porque existen ovocitos pendientes de procesar.',
          );
        }
      }
      treatment.status = dto.status as TreatmentStatus;

      // Si el tratamiento se cierra o completa, liberar la historia clínica (ya no es el tratamiento actual)
      if (
        treatment.status === TreatmentStatus.closed ||
        treatment.status === TreatmentStatus.completed
      ) {
        if (treatment.medicalHistory) {
          treatment.medicalHistory.currentTreatment = null;
          await this.medicalHistoryRepo.save(treatment.medicalHistory);
        }
      }
    }
    if (dto.closureReason !== undefined) {
      treatment.closureReason = dto.closureReason;
    }
    if (dto.closureDate !== undefined) {
      treatment.closureDate = parseDateFromString(dto.closureDate);
    }

    return await this.treatmentRepo.save(treatment);
  }

  /**
   * Obtiene todos los tratamientos con estado vigente
   */
  async findAllActive(): Promise<Treatment[]> {
    return this.treatmentRepo.find({
      where: { status: TreatmentStatus.vigente },
      relations: ['medicalHistory', 'medicalHistory.patient', 'initialDoctor'],
    });
  }

  /**
   * Calcula la fecha de última actividad clínica relevante del tratamiento
   * Busca la fecha más reciente en: monitorings, doctor_notes, medication_protocols,
   * post_transfer_milestones, medical_orders, puncture_records
   */
  async getLastActivityDate(treatmentId: number): Promise<Date | null> {
    // Buscar la fecha más reciente en cada tabla relacionada
    const [
      lastMonitoring,
      lastMonitoringPlan,
      lastDoctorNote,
      lastProtocol,
      lastMilestone,
      lastOrder,
      lastPuncture,
      treatment,
    ] = await Promise.all([
      this.monitoringRepo.findOne({
        where: { treatment: { id: treatmentId } },
        order: { createdAt: 'DESC' },
        select: ['id', 'createdAt'],
      }),
      this.monitoringPlanRepo.findOne({
        where: { treatment: { id: treatmentId } },
        order: { createdAt: 'DESC' },
        select: ['id', 'createdAt'],
      }),
      this.doctorNoteRepo.findOne({
        where: { treatment: { id: treatmentId } },
        order: { createdAt: 'DESC' },
        select: ['id', 'createdAt'],
      }),
      this.medicationProtocolRepo.findOne({
        where: { treatment: { id: treatmentId } },
        order: { updatedAt: 'DESC' },
        select: ['id', 'updatedAt'],
      }),
      this.milestoneRepo.findOne({
        where: { treatment: { id: treatmentId } },
        order: { createdAt: 'DESC' },
        select: ['id', 'createdAt'],
      }),
      this.medicalOrderRepo.findOne({
        where: { treatment: { id: treatmentId } },
        order: { createdAt: 'DESC' },
        select: ['id', 'createdAt'],
      }),
      this.punctureRepo.findOne({
        where: { treatment: { id: treatmentId } },
        order: { createdAt: 'DESC' },
        select: ['id', 'createdAt'],
      }),
      this.treatmentRepo.findOne({
        where: { id: treatmentId },
        select: ['id', 'createdAt'],
      }),
    ]);

    // Recopilar todas las fechas válidas
    const dates: Date[] = [];
    if (lastMonitoring?.createdAt) dates.push(lastMonitoring.createdAt);
    if (lastMonitoringPlan?.createdAt) dates.push(lastMonitoringPlan.createdAt);
    if (lastDoctorNote?.createdAt) dates.push(lastDoctorNote.createdAt);
    if (lastProtocol?.updatedAt) dates.push(lastProtocol.updatedAt);
    if (lastMilestone?.createdAt) dates.push(lastMilestone.createdAt);
    if (lastOrder?.createdAt) dates.push(lastOrder.createdAt);
    if (lastPuncture?.createdAt) dates.push(lastPuncture.createdAt);
    if (treatment?.createdAt) dates.push(treatment.createdAt);

    if (dates.length === 0) {
      return null;
    }

    // Retornar la fecha más reciente
    return new Date(Math.max(...dates.map((d) => d.getTime())));
  }

  /**
   * Cierra un tratamiento automáticamente por inactividad
   */
  async closeTreatmentByInactivity(treatmentId: number): Promise<Treatment> {
    const treatment = await this.treatmentRepo.findOne({
      where: { id: treatmentId },
      relations: ['medicalHistory'],
    });

    if (!treatment) {
      throw new NotFoundException('Tratamiento no encontrado');
    }

    treatment.status = TreatmentStatus.closed;
    treatment.closureReason = 'Cierre automático por inactividad (60 días)';
    treatment.closureDate = new Date();

    if (treatment.medicalHistory) {
      treatment.medicalHistory.currentTreatment = null;
      await this.medicalHistoryRepo.save(treatment.medicalHistory);
    }

    return this.treatmentRepo.save(treatment);
  }

  /**
   * Reasigna un tratamiento a otro médico (solo para Director Médico)
   */
  async reassignDoctor(
    treatmentId: number,
    newDoctorId: number,
  ): Promise<Treatment> {
    const treatment = await this.treatmentRepo.findOne({
      where: { id: treatmentId },
      relations: ['initialDoctor'],
    });

    if (!treatment) {
      throw new NotFoundException('Tratamiento no encontrado');
    }

    treatment.initialDoctor = { id: newDoctorId } as any;
    return this.treatmentRepo.save(treatment);
  }

  async createDefaultMonitoringPlans(
    treatmentId: number,
    stimulationStartDate: Date,
  ) {
    const sequences = [
      { sequence: 1, plannedDay: 7 },
      { sequence: 2, plannedDay: 10 },
      { sequence: 3, plannedDay: 13 },
    ];

    for (const { sequence, plannedDay } of sequences) {
      const baseDate = new Date(stimulationStartDate);
      baseDate.setDate(baseDate.getDate() + plannedDay);

      const minDate = new Date(baseDate);
      minDate.setDate(minDate.getDate() - 1);

      const maxDate = new Date(baseDate);
      maxDate.setDate(maxDate.getDate() + 1);

      await this.monitoringPlanService.create({
        treatmentId,
        sequence,
        plannedDay,
        minDate,
        maxDate,
      });
    }
  }
  async createMonitoring(treatmentId: number, dto: CreateMonitoringDto) {
    const treatment = await this.treatmentRepo.findOne({
      where: { id: treatmentId },
    });

    if (!treatment) {
      throw new NotFoundException('Tratamiento no encontrado');
    }

    const monitoring = this.monitoringRepo.create({
      treatmentId,
      treatment,
      monitoringDate: new Date(dto.monitoringDate),
      dayNumber: dto.dayNumber ?? null,
      follicleCount: dto.follicleCount ?? null,
      follicleSize: dto.follicleSize ?? null,
      estradiolLevel: dto.estradiolLevel ?? null,
      observations: dto.observations ?? null,
    });
    if (dto.monitoringPlanId) {
      const plan = await this.monitoringPlanRepo.findOne({
        where: {
          id: dto.monitoringPlanId,
          treatment: { id: treatmentId },
        },
      });

      if (!plan) {
        throw new NotFoundException(
          `MonitoringPlan ${dto.monitoringPlanId} no encontrado para el tratamiento ${treatmentId}`,
        );
      }

      plan.status = MonitoringPlanStatus.COMPLETED;
      await this.monitoringPlanRepo.save(plan);
    }

    return this.monitoringRepo.save(monitoring);
  }

  async findOne(id: number): Promise<Treatment> {
    const treatment = await this.treatmentRepo.findOne({
      where: { id },
      relations: ['medicalHistory', 'initialDoctor'],
    });
    if (!treatment) {
      throw new NotFoundException('Tratamiento no encontrado');
    }
    return treatment;
  }
}
