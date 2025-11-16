import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InformedConsent } from '../entities/informed-consent.entity';

@Injectable()
export class InformedConsentService {
  constructor(
    @InjectRepository(InformedConsent)
    private readonly informedConsentRepository: Repository<InformedConsent>,
  ) {}

  async findByTreatmentId(treatmentId: number): Promise<InformedConsent | null> {
    return this.informedConsentRepository.findOne({
      where: { treatment: { id: treatmentId } },
      relations: ['treatment', 'uploadedByUser'],
    });
  }

  async findOne(id: number): Promise<InformedConsent> {
    const consent = await this.informedConsentRepository.findOne({
      where: { id },
      relations: ['treatment', 'uploadedByUser'],
    });

    if (!consent) {
      throw new NotFoundException(`Informed consent with ID ${id} not found`);
    }

    return consent;
  }

  async create(consentData: Partial<InformedConsent>): Promise<InformedConsent> {
    const consent = this.informedConsentRepository.create(consentData);
    return this.informedConsentRepository.save(consent);
  }

  async update(
    id: number,
    consentData: Partial<InformedConsent>,
  ): Promise<InformedConsent> {
    const consent = await this.findOne(id);
    Object.assign(consent, consentData);
    return this.informedConsentRepository.save(consent);
  }

  async remove(id: number): Promise<void> {
    const consent = await this.findOne(id);
    await this.informedConsentRepository.remove(consent);
  }
}
