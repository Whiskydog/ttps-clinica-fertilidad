import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InformedConsent } from '../entities/informed-consent.entity';
import { UploadsService } from '@modules/uploads/uploads.service';

@Injectable()
export class InformedConsentService {
  constructor(
    @InjectRepository(InformedConsent)
    private readonly informedConsentRepository: Repository<InformedConsent>,
    private readonly uploadsService: UploadsService,
  ) {}

  async findByTreatmentId(treatmentId: number): Promise<InformedConsent | null> {
    return this.informedConsentRepository.findOne({
      where: { treatment: { id: treatmentId } },
      relations: ['treatment', 'uploadedByUser'],
    });
  }

  /**
   * Verifica si un tratamiento tiene un consentimiento informado válido (subido y firmado)
   * @returns true si existe consentimiento con PDF y fecha de firma
   */
  async hasValidConsent(treatmentId: number): Promise<boolean> {
    const consent = await this.informedConsentRepository.findOne({
      where: { treatment: { id: treatmentId } },
      select: ['id', 'pdfUri', 'signatureDate'],
    });

    if (!consent) {
      return false;
    }

    // El consentimiento es válido si tiene PDF subido Y fecha de firma
    return !!(consent.pdfUri && consent.signatureDate);
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
    return await this.informedConsentRepository.save(consent);
  }

  async update(
    id: number,
    consentData: Partial<InformedConsent>,
  ): Promise<InformedConsent> {
    const consent = await this.findOne(id);

    // Si se está actualizando el pdfUri y es diferente al actual, eliminar el archivo viejo
    if ('pdfUri' in consentData) {
      const oldPdfUri = consent.pdfUri;
      const newPdfUri = consentData.pdfUri;

      if (oldPdfUri && oldPdfUri !== newPdfUri) {
        await this.uploadsService.deleteFile(oldPdfUri);
      }
    }

    Object.assign(consent, consentData);
    return await this.informedConsentRepository.save(consent);
  }

  async remove(id: number): Promise<void> {
    const consent = await this.findOne(id);

    // Eliminar el archivo asociado si existe
    if (consent.pdfUri) {
      await this.uploadsService.deleteFile(consent.pdfUri);
    }

    await this.informedConsentRepository.remove(consent);
  }
}
