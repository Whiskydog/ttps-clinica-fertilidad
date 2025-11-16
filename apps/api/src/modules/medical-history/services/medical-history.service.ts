import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalHistory } from '../entities/medical-history.entity';
import { GynecologicalHistory } from '../entities/gynecological-history.entity';
import { PartnerData } from '../entities/partner-data.entity';
import { MedicalHistoryAuditService } from './medical-history-audit.service';
import { PartnerDataService } from './partner-data.service';
import { GynecologicalHistoryService } from './gynecological-history.service';
import { HabitsService } from './habits.service';
import { FenotypeService } from './fenotype.service';
import { BackgroundService } from './background.service';
import { PatientsService } from '../../users/services/patients.service';

@Injectable()
export class MedicalHistoryService {
  async update(
    id: number,
    dto: { physicalExamNotes?: string; familyBackgrounds?: string },
    doctorId: number,
  ): Promise<MedicalHistory | null> {
    const mh = await this.medicalHistoryRepo.findOne({ where: { id } });
    if (!mh) return null;

    let updated = false;
    if (typeof dto.physicalExamNotes !== 'undefined') {
      const oldValue = mh.physicalExamNotes;
      mh.physicalExamNotes = dto.physicalExamNotes;
      await this.auditService.logFieldChange(
        'medical_histories',
        mh.id,
        'physical_exam_notes',
        oldValue,
        dto.physicalExamNotes,
        doctorId,
      );
      updated = true;
    }

    if (typeof dto.familyBackgrounds !== 'undefined') {
      const oldValue = mh.familyBackgrounds;
      mh.familyBackgrounds = dto.familyBackgrounds;
      await this.auditService.logFieldChange(
        'medical_histories',
        mh.id,
        'family_backgrounds',
        oldValue,
        dto.familyBackgrounds,
        doctorId,
      );
      updated = true;
    }

    if (updated) {
      return this.medicalHistoryRepo.save(mh);
    }
    return mh;
  }

  constructor(
    @InjectRepository(MedicalHistory)
    private readonly medicalHistoryRepo: Repository<MedicalHistory>,
    @InjectRepository(GynecologicalHistory)
    private readonly gyneRepo: Repository<GynecologicalHistory>,
    private readonly patientsService: PatientsService,
    private readonly auditService: MedicalHistoryAuditService,
    private readonly partnerDataService: PartnerDataService,
    private readonly gynecologicalHistoryService: GynecologicalHistoryService,
    private readonly habitsService: HabitsService,
    private readonly fenotypeService: FenotypeService,
    private readonly backgroundService: BackgroundService,
  ) {}

  async findByUserId(userId: number) {
    const patient = await this.patientsService.findPatientById(userId);
    if (!patient) return null;
    const mh = await this.medicalHistoryRepo.findOne({
      where: { patient: { id: patient.id } },
      relations: ['patient'],
    });
    if (!mh) return null;

    // traer explícitamente los datos de la pareja y el historial ginecológico
    const partners = await this.partnerDataService.findByMedicalHistory(mh.id);

    // para el historial ginecológico hay que consultar de forma distinta
    const gynecologicalHistory = await this.gyneRepo.find({
      where: { medicalHistory: { id: mh.id } },
      relations: ['partnerData'],
      order: { id: 'DESC' },
    });

    // Fetch new related data
    const habits = await this.habitsService.findByMedicalHistoryId(mh.id);
    const fenotypes = await this.fenotypeService.findByMedicalHistoryId(mh.id);
    const backgrounds = await this.backgroundService.findByMedicalHistoryId(mh.id);

    // adjuntar la pareja más relevante (la última) y la lista de historiales ginecológicos
    return {
      ...mh,
      partnerData: partners,
      gynecologicalHistory,
      habits,
      fenotypes,
      backgrounds,
    };
  }

  async findById(id: number) {
    return this.medicalHistoryRepo.findOne({ where: { id } });
  }

  async createForPatient(patientId: number) {
    // Crear HC solo si el paciente existe y aún no tiene una HC asociada
    const patient = await this.patientsService.findPatientById(patientId);
    if (!patient) {
      throw new ConflictException('Paciente no encontrado');
    }

    const already = await this.medicalHistoryRepo.findOne({
      where: { patient: { id: patient.id } },
    });
    if (already) {
      throw new ConflictException(
        'Ya existe una historia clínica para este paciente',
      );
    }

    const hc = this.medicalHistoryRepo.create({ patient });
    const saved = await this.medicalHistoryRepo.save(hc);
    await this.auditService.logCreation(
      'medical_histories',
      saved.id,
      patient.id,
    );
    return saved;
  }

  async upsertPartnerData(
    medicalHistoryId: number,
    partnerDto: Record<string, unknown>,
    doctorId: number,
  ): Promise<PartnerData> {
    return this.partnerDataService.upsertPartnerData(
      medicalHistoryId,
      partnerDto as Partial<PartnerData>,
      doctorId,
    );
  }

  async upsertGynecologicalHistory(
    medicalHistoryId: number,
    gyneDto: Record<string, unknown>,
    doctorId: number,
  ): Promise<GynecologicalHistory> {
    return this.gynecologicalHistoryService.upsertGynecologicalHistory(
      medicalHistoryId,
      gyneDto,
      doctorId,
    );
  }
}
