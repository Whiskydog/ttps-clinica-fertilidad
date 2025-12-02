import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PunctureRecord } from '../entities/puncture-record.entity';
import { InformedConsentService } from '@modules/treatments/services/informed-consent.service';

@Injectable()
export class PunctureRecordService {
  constructor(
    @InjectRepository(PunctureRecord)
    private readonly punctureRecordRepository: Repository<PunctureRecord>,
    private readonly informedConsentService: InformedConsentService,
  ) {}

  async findByTreatmentId(treatmentId: number): Promise<PunctureRecord[]> {
    return this.punctureRecordRepository.find({
      where: { treatment: { id: treatmentId } },
      relations: ['treatment', 'labTechnician'],
      order: { punctureDateTime: 'DESC' },
    });
  }

  async findOne(id: number): Promise<PunctureRecord> {
    const record = await this.punctureRecordRepository.findOne({
      where: { id },
      relations: ['treatment', 'labTechnician'],
    });

    if (!record) {
      throw new NotFoundException(`Puncture record with ID ${id} not found`);
    }

    return record;
  }

  async create(recordData: Partial<PunctureRecord>): Promise<PunctureRecord> {
    // Verificar consentimiento informado
    const treatmentId = (recordData.treatment as any)?.id;
    if (treatmentId) {
      const hasConsent = await this.informedConsentService.hasValidConsent(treatmentId);
      if (!hasConsent) {
        throw new ForbiddenException(
          'No se puede crear un registro de punción sin consentimiento informado firmado. ' +
          'Por favor, suba el consentimiento firmado antes de continuar.'
        );
      }
    }

    const record = this.punctureRecordRepository.create(recordData);
    return this.punctureRecordRepository.save(record);
  }

  async update(
    id: number,
    recordData: Partial<PunctureRecord>,
  ): Promise<PunctureRecord> {
    const record = await this.findOne(id);
    Object.assign(record, recordData);
    return this.punctureRecordRepository.save(record);
  }

  async remove(id: number): Promise<void> {
    const record = await this.findOne(id);
    await this.punctureRecordRepository.remove(record);
  }
}
