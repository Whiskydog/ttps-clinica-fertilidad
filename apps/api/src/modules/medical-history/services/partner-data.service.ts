import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartnerData } from '../entities/partner-data.entity';
import { MedicalHistory } from '../entities/medical-history.entity';
import { MedicalHistoryAuditService } from './medical-history-audit.service';
import { parseBirthDate } from '../utils';

@Injectable()
export class PartnerDataService {
  constructor(
    @InjectRepository(PartnerData)
    private readonly partnerRepo: Repository<PartnerData>,
    @InjectRepository(MedicalHistory)
    private readonly medicalHistoryRepo: Repository<MedicalHistory>,
    private readonly auditService: MedicalHistoryAuditService,
  ) {}

  async findByMedicalHistory(
    medicalHistoryId: number,
  ): Promise<PartnerData | null> {
    return this.partnerRepo.findOne({
      where: {
        medicalHistory: { id: medicalHistoryId },
      },
    });
  }

  async ensureMedicalHistoryExists(
    medicalHistoryId: number,
  ): Promise<MedicalHistory> {
    const mh = await this.medicalHistoryRepo.findOne({
      where: { id: medicalHistoryId },
    });
    if (!mh) {
      throw new NotFoundException('Historia clínica no encontrada');
    }
    return mh;
  }

  async createPartnerData(
    medicalHistoryId: number,
    partnerData: Partial<PartnerData>,
    doctorId: number,
  ): Promise<PartnerData> {
    const medicalHistory =
      await this.ensureMedicalHistoryExists(medicalHistoryId);

    const partnerToCreate = this.partnerRepo.create(
      partnerData as Partial<PartnerData>,
    );
    partnerToCreate.medicalHistory = medicalHistory;

    if (partnerData.birthDate) {
      partnerToCreate.birthDate = parseBirthDate(
        partnerData.birthDate as unknown as string,
      );
    }

    const saved = await this.partnerRepo.save(partnerToCreate);

    // Audit creation
    const fieldMap: Record<string, string> = {
      firstName: 'first_name',
      lastName: 'last_name',
      dni: 'dni',
      birthDate: 'birth_date',
      occupation: 'occupation',
      phone: 'phone',
      email: 'email',
      biologicalSex: 'biological_sex',
      genitalBackgrounds: 'genital_backgrounds',
    };

    await this.auditService.logAllNonNullFields(
      'partner_data',
      saved.id,
      fieldMap,
      saved,
      doctorId,
    );

    return saved;
  }

  async updatePartnerData(
    existing: PartnerData,
    updates: Partial<PartnerData>,
    doctorId: number,
  ): Promise<PartnerData> {
    const fieldMap: Record<string, string> = {
      firstName: 'first_name',
      lastName: 'last_name',
      dni: 'dni',
      birthDate: 'birth_date',
      occupation: 'occupation',
      phone: 'phone',
      email: 'email',
      biologicalSex: 'biological_sex',
      genitalBackgrounds: 'genital_backgrounds',
    };

    await this.auditService.logMultipleFieldChanges(
      'partner_data',
      existing.id,
      fieldMap,
      existing,
      updates,
      doctorId,
    );

    Object.assign(existing, updates);
    return this.partnerRepo.save(existing);
  }

  async upsertPartnerData(
    medicalHistoryId: number,
    partnerData: Partial<PartnerData>,
    doctorId: number,
  ): Promise<PartnerData> {
    await this.ensureMedicalHistoryExists(medicalHistoryId);

    const existing = await this.findByMedicalHistory(medicalHistoryId);

    if (existing) {
      return this.updatePartnerData(existing, partnerData, doctorId);
    }

    return this.createPartnerData(medicalHistoryId, partnerData, doctorId);
  }
}
