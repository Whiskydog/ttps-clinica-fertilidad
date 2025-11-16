import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Treatment } from './entities/treatment.entity';
import { Monitoring } from './entities/monitoring.entity';
import { MedicationProtocol } from './entities/medication-protocol.entity';
import { DoctorNote } from './entities/doctor-note.entity';
import { MedicalHistory } from '../medical-history/entities/medical-history.entity';
import { TreatmentStatus } from '@repo/contracts';
import { InformedConsentService } from './services/informed-consent.service';
import { PostTransferMilestoneService } from './services/post-transfer-milestone.service';
import { MedicalCoverageService } from './services/medical-coverage.service';

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
  ) {}

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

  async getTreatmentDetail(treatmentId: number, patientId: number) {
    const medicalHistory = await this.medicalHistoryRepository.findOne({
      where: { patient: { id: patientId } },
    });

    if (!medicalHistory) {
      throw new NotFoundException('Medical history not found');
    }

    const treatment = await this.treatmentRepository.findOne({
      where: {
        id: treatmentId,
        medicalHistory: { id: medicalHistory.id },
      },
      relations: ['initialDoctor'],
    });

    if (!treatment) {
      throw new NotFoundException('Treatment not found');
    }

    const monitorings = await this.monitoringRepository.find({
      where: { treatment: { id: treatmentId } },
      order: { monitoringDate: 'ASC' },
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
        status: TreatmentStatus.closed,
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
