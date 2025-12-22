import { parseDateFromString } from '@common/utils/date.utils';
import { PunctureRecord } from '@modules/laboratory/entities/puncture-record.entity';
import { MedicalHistory } from '@modules/medical-history/entities/medical-history.entity';
import { MedicalOrder } from '@modules/medical-orders/entities/medical-order.entity';
import { PaymentsService } from '@modules/payments/payments.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InitialObjective, TreatmentStatus } from '@repo/contracts';
import { Repository } from 'typeorm';
import { CreateTreatmentDto, UpdateTreatmentDto } from './dto';
import { DoctorNote } from './entities/doctor-note.entity';
import { MedicationProtocol } from './entities/medication-protocol.entity';
import { Monitoring } from './entities/monitoring.entity';
import { PostTransferMilestone } from './entities/post-transfer-milestone.entity';
import { Treatment } from './entities/treatment.entity';

@Injectable()
export class TreatmentService {
  constructor(
    @InjectRepository(Treatment)
    private readonly treatmentRepo: Repository<Treatment>,
    @InjectRepository(Monitoring)
    private readonly monitoringRepo: Repository<Monitoring>,
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
    private readonly paymentsService: PaymentsService,
  ) {}

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

    await this.paymentsService.registerPaymentOrder(
      saved.id,
      medicalHistory.patient.id,
      medicalHistory.patient.medicalInsurance.externalId,
    );

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
      treatment.status = dto.status as TreatmentStatus;
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
    });

    if (!treatment) {
      throw new NotFoundException('Tratamiento no encontrado');
    }

    treatment.status = TreatmentStatus.closed;
    treatment.closureReason = 'Cierre automático por inactividad (60 días)';
    treatment.closureDate = new Date();

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
}
