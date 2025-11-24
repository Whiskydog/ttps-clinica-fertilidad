import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GynecologicalHistory } from '../entities/gynecological-history.entity';
import { MedicalHistory } from '../entities/medical-history.entity';
import { PartnerData } from '../entities/partner-data.entity';
import { MedicalHistoryAuditService } from './medical-history-audit.service';
import { PartnerDataService } from './partner-data.service';

@Injectable()
export class GynecologicalHistoryService {
  constructor(
    @InjectRepository(GynecologicalHistory)
    private readonly gyneRepo: Repository<GynecologicalHistory>,
    @InjectRepository(MedicalHistory)
    private readonly medicalHistoryRepo: Repository<MedicalHistory>,
    private readonly partnerDataService: PartnerDataService,
    private readonly auditService: MedicalHistoryAuditService,
  ) {}

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

  async findExistingGynecologicalRecord(
    medicalHistoryId: number,
    partnerDataId?: number | null,
    gyneId?: number,
  ): Promise<GynecologicalHistory | null> {
    if (gyneId) {
      const existing = await this.gyneRepo.findOne({
        where: { id: gyneId },
        relations: ['partnerData', 'medicalHistory'],
      });
      if (!existing) {
        throw new NotFoundException('Registro ginecológico no encontrado');
      }
      return existing;
    }

    return this.gyneRepo.findOne({
      where: partnerDataId
        ? {
            medicalHistory: { id: medicalHistoryId },
            partnerData: { id: partnerDataId },
          }
        : { medicalHistory: { id: medicalHistoryId }, partnerData: null },
      relations: ['partnerData', 'medicalHistory'],
    });
  }

  async handlePartnerDataForGynecology(
    medicalHistoryId: number,
    partnerData: Record<string, unknown> | undefined | null,
    doctorId: number,
  ): Promise<number | null> {
    if (!partnerData) return null;

    const hasPartnerData = Object.values(partnerData).some(
      (v) => v !== undefined && v !== null && v !== '',
    );

    if (!hasPartnerData) return null;

    const partnerSaved = await this.partnerDataService.upsertPartnerData(
      medicalHistoryId,
      partnerData as Partial<PartnerData>,
      doctorId,
    );

    return partnerSaved.id;
  }

  async createGynecologicalHistory(
    medicalHistoryId: number,
    gyneData: Record<string, unknown>,
    partnerDataId: number | null,
    doctorId: number,
  ): Promise<GynecologicalHistory> {
    const medicalHistory =
      await this.ensureMedicalHistoryExists(medicalHistoryId);

    let partnerData: PartnerData | null = null;
    if (partnerDataId) {
      partnerData =
        await this.partnerDataService.findByMedicalHistory(medicalHistoryId);
      // Verify it's a female partner for gynecology
      if (partnerData && partnerData.biologicalSex !== 'female') {
        throw new Error(
          'Solo se puede registrar historia ginecológica para parejas femeninas',
        );
      }
    }

    const gyneToCreate = this.gyneRepo.create({
      ...gyneData,
      medicalHistory,
      partnerData,
    });

    const savedGyne = (await this.gyneRepo.save(
      gyneToCreate,
    )) as GynecologicalHistory;

    // Audit all fields
    const fieldMap: Record<string, string> = {
      menarcheAge: 'menarche_age',
      cycleRegularity: 'cycle_regularity',
      cycleDurationDays: 'cycle_duration_days',
      bleedingCharacteristics: 'bleeding_characteristics',
      gestations: 'gestations',
      births: 'births',
      abortions: 'abortions',
      ectopicPregnancies: 'ectopic_pregnancies',
    };

    await this.auditService.logAllNonNullFields(
      'gynecological_history',
      savedGyne.id,
      fieldMap,
      savedGyne,
      doctorId,
    );

    return savedGyne;
  }

  async updateGynecologicalHistory(
    existing: GynecologicalHistory,
    updates: Record<string, unknown>,
    partnerDataId: number | null,
    doctorId: number,
  ): Promise<GynecologicalHistory> {
    const fieldMap: Record<string, string> = {
      menarcheAge: 'menarche_age',
      cycleRegularity: 'cycle_regularity',
      cycleDurationDays: 'cycle_duration_days',
      bleedingCharacteristics: 'bleeding_characteristics',
      gestations: 'gestations',
      births: 'births',
      abortions: 'abortions',
      ectopicPregnancies: 'ectopic_pregnancies',
    };

    await this.auditService.logMultipleFieldChanges(
      'gynecological_history',
      existing.id,
      fieldMap,
      existing,
      updates,
      doctorId,
    );

    Object.assign(existing, updates);

    if (partnerDataId) {
      const partnerData = await this.partnerDataService.findByMedicalHistory(
        existing.medicalHistory.id,
      );
      // Verify it's a female partner for gynecology
      if (partnerData && partnerData.biologicalSex !== 'female') {
        throw new Error(
          'Solo se puede registrar historia ginecológica para parejas femeninas',
        );
      }
      existing.partnerData = partnerData;
    }

    return this.gyneRepo.save(existing);
  }

  async upsertGynecologicalHistory(
    medicalHistoryId: number,
    gyneData: {
      id?: number;
      partnerData?: Record<string, unknown>;
      menarcheAge?: number | null;
      cycleRegularity?: string | null;
      cycleDurationDays?: number | null;
      bleedingCharacteristics?: string | null;
      gestations?: number | null;
      births?: number | null;
      abortions?: number | null;
      ectopicPregnancies?: number | null;
    },
    doctorId: number,
  ): Promise<GynecologicalHistory> {
    const partnerDataId = await this.handlePartnerDataForGynecology(
      medicalHistoryId,
      gyneData.partnerData,
      doctorId,
    );

    const existing = await this.findExistingGynecologicalRecord(
      medicalHistoryId,
      partnerDataId,
      gyneData.id,
    );

    if (existing) {
      return this.updateGynecologicalHistory(
        existing,
        gyneData,
        partnerDataId,
        doctorId,
      );
    }

    return this.createGynecologicalHistory(
      medicalHistoryId,
      gyneData,
      partnerDataId,
      doctorId,
    );
  }
}
