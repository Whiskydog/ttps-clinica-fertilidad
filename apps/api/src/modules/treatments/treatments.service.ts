import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Treatment } from './entities/treatment.entity';
import { Monitoring } from './entities/monitoring.entity';
import { MedicationProtocol } from './entities/medication-protocol.entity';
import { DoctorNote } from './entities/doctor-note.entity';
import { MedicalHistory } from '../medical-history/entities/medical-history.entity';
import { TreatmentStatus, RoleCode } from '@repo/contracts';
import { MedicalOrder } from '@modules/medical-orders/entities/medical-order.entity';
import { InformedConsentService } from './services/informed-consent.service';
import { PostTransferMilestoneService } from './services/post-transfer-milestone.service';
import { MedicalCoverageService } from './services/medical-coverage.service';
import { MonitoringPlan } from './entities/monitoring-plan.entity';

@Injectable()
export class TreatmentsService {
  constructor(
    @InjectRepository(Treatment)
    private treatmentRepository: Repository<Treatment>,
    @InjectRepository(Monitoring)
    private monitoringRepository: Repository<Monitoring>,
    @InjectRepository(MedicationProtocol)
    private protocolRepository: Repository<MedicationProtocol>,
    @InjectRepository(DoctorNote)
    private doctorNoteRepository: Repository<DoctorNote>,
    @InjectRepository(MedicalHistory)
    private medicalHistoryRepository: Repository<MedicalHistory>,
    private readonly informedConsentService: InformedConsentService,
    private readonly milestoneService: PostTransferMilestoneService,
    private readonly coverageService: MedicalCoverageService,
    @InjectRepository(MonitoringPlan)
    private monitoringPlanRepository: Repository<MonitoringPlan>,
    @InjectRepository(MedicalOrder)
    private medicalOrderRepository: Repository<MedicalOrder>,
  ) { }

  async getCurrentTreatmentByPatient(patientId: number) {
    const medicalHistory = await this.medicalHistoryRepository.findOne({
      where: { patient: { id: patientId } },
    });

    if (!medicalHistory) {
      throw new NotFoundException('Medical history not found');
    }

    const treatment = await this.treatmentRepository.findOne({
      where: {
        medicalHistory: { id: medicalHistory.id },
        status: TreatmentStatus.vigente,
      },
      relations: ['initialDoctor'],
    });

    return treatment;
  }

  async getTreatmentDetail(
    treatmentId: number,
    userId: number,
    userRole?: RoleCode,
  ) {
    // First, try to find the treatment with all its relations
    const treatment = await this.treatmentRepository.findOne({
      where: { id: treatmentId },
      relations: ['initialDoctor', 'medicalHistory', 'medicalHistory.patient'],
    });

    if (!treatment) {
      throw new NotFoundException('Treatment not found');
    }

    // Verify access: user must be the patient, the doctor, or a director
    const isPatient = treatment.medicalHistory?.patient?.id === userId;
    const isDoctor = treatment.initialDoctor?.id === userId;
    const isDirector = userRole === RoleCode.DIRECTOR;

    if (!isPatient && !isDoctor && !isDirector) {
      throw new NotFoundException('Treatment not found'); // Don't reveal existence
    }

    const monitorings = await this.monitoringRepository.find({
      where: { treatment: { id: treatmentId } },
      order: { monitoringDate: 'ASC' },
    });

    const monitoringPlans = await this.monitoringPlanRepository.find({
      where: { treatmentId },
      withDeleted: true,
      order: { sequence: 'ASC' },
    });

    const protocol = await this.protocolRepository.findOne({
      where: { treatment: { id: treatmentId } },
    });

    const doctorNotes = await this.doctorNoteRepository.find({
      where: { treatment: { id: treatmentId } },
      order: { noteDate: 'ASC' },
      relations: ['doctor'],
    });

    const informedConsent =
      await this.informedConsentService.findByTreatmentId(treatmentId);

    const milestones =
      await this.milestoneService.findByTreatmentId(treatmentId);

    const medicalCoverage =
      await this.coverageService.findByTreatmentId(treatmentId);

    return {
      treatment,
      monitorings,
      monitoringPlans,
      protocol,
      doctorNotes,
      informedConsent,
      milestones,
      medicalCoverage,
    };
  }

  async getTreatmentHistory(patientId: number) {
    const medicalHistory = await this.medicalHistoryRepository.findOne({
      where: { patient: { id: patientId } },
    });

    if (!medicalHistory) {
      return [];
    }

    const treatments = await this.treatmentRepository.find({
      where: {
        medicalHistory: { id: medicalHistory.id },
        status: In([TreatmentStatus.closed, TreatmentStatus.completed]),
      },
      relations: ['initialDoctor'],
      order: { createdAt: 'DESC' },
    });

    return treatments;
  }

  async create(medicalHistoryId: number, data: Partial<Treatment>) {
    const medicalHistory = await this.medicalHistoryRepository.findOne({
      where: { id: medicalHistoryId },
    });

    if (!medicalHistory) {
      throw new NotFoundException('Medical history not found');
    }

    const treatment = this.treatmentRepository.create({
      medicalHistory,
      ...data,
    });
    return await this.treatmentRepository.save(treatment);
  }

  async findByMedicalHistory(medicalHistoryId: number) {
    return await this.treatmentRepository.find({
      where: { medicalHistory: { id: medicalHistoryId } },
      relations: ['initialDoctor'],
    });
  }
}
