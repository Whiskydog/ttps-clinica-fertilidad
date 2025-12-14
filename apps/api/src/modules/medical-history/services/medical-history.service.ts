import { Injectable, ConflictException, Logger } from '@nestjs/common';
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
import { BiologicalSex } from '@repo/contracts';

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
    private readonly logger: Logger,
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

    //info paciente
    const patient = await this.patientsService.findPatientById(userId);
    this.logger.log(`Patient found: ${JSON.stringify(patient)}`);
    if (!patient) return null;
    
    // historia clínica
    const mh = await this.medicalHistoryRepo.findOne({
      where: { patient: { id: patient.id } },
      relations: ['patient', 'currentTreatment'],
    });
    this.logger.log(`MH found: ${JSON.stringify(mh)}`);
    if (!mh) return null;
    
    // traer datos de la pareja
    const partners = await this.partnerDataService.findByMedicalHistory(mh.id);
    this.logger.log(`Partners found: ${JSON.stringify(partners)}`);

    // datos del historial ginecológico
    const gynecologicalHistory = await this.gyneRepo.find({
      where: { medicalHistory: { id: mh.id } },
      relations: ['partnerData'],
      order: { id: 'DESC' },
    });
    this.logger.log(`Gynecological history found: ${JSON.stringify(gynecologicalHistory)}`);

    // habitos
    const habits = await this.habitsService.findByMedicalHistoryId(mh.id);
    this.logger.log(`Habits found: ${JSON.stringify(habits)}`);
    // fenotipos
    const fenotypes = await this.fenotypeService.findByMedicalHistoryId(mh.id);
    this.logger.log(`Fenotypes found: ${JSON.stringify(fenotypes)}`);
    // antecedentes
    const backgrounds = await this.backgroundService.findByMedicalHistoryId(mh.id);
    this.logger.log(`Backgrounds found: ${JSON.stringify(backgrounds)}`);
    
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
    return this.medicalHistoryRepo.findOne({
      where: { id },
      relations: ['currentTreatment'],
    });
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

    // Crear entidades relacionadas vacías para facilitar la edición posterior
    // Crear Habits vacío
    await this.habitsService.create({
      medicalHistory: saved,
    });

    // Crear Fenotype vacío (para el paciente, no para pareja)
    await this.fenotypeService.create({
      medicalHistory: saved,
    });

    // Crear GynecologicalHistory vacío solo si el paciente es femenino
    if (patient.biologicalSex === BiologicalSex.FEMALE) {
      const gyneRecord = this.gyneRepo.create({
        medicalHistory: saved,
      });
      await this.gyneRepo.save(gyneRecord);
    }

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

  async save(medicalHistory: MedicalHistory): Promise<MedicalHistory> {
    return this.medicalHistoryRepo.save(medicalHistory);
  }
}
