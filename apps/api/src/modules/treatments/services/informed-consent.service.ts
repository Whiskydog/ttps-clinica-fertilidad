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
    console.log('[DEBUG] InformedConsentService.create - Datos recibidos:', JSON.stringify(consentData));
    const consent = this.informedConsentRepository.create(consentData);
    console.log('[DEBUG] InformedConsentService.create - Entidad creada:', JSON.stringify(consent));
    const saved = await this.informedConsentRepository.save(consent);
    console.log('[DEBUG] InformedConsentService.create - Entidad guardada:', JSON.stringify(saved));
    return saved;
  }

  async update(
    id: number,
    consentData: Partial<InformedConsent>,
  ): Promise<InformedConsent> {
    console.log('[DEBUG] InformedConsentService.update - ID:', id);
    console.log('[DEBUG] InformedConsentService.update - Datos recibidos:', JSON.stringify(consentData));
    const consent = await this.findOne(id);
    console.log('[DEBUG] InformedConsentService.update - Entidad encontrada antes del update:', JSON.stringify(consent));

    // Si se está actualizando el pdfUri y es diferente al actual, eliminar el archivo viejo
    if ('pdfUri' in consentData) {
      const oldPdfUri = consent.pdfUri;
      const newPdfUri = consentData.pdfUri;

      // Si el nuevo URI es diferente al antiguo (o es null), eliminar el archivo viejo
      if (oldPdfUri && oldPdfUri !== newPdfUri) {
        console.log('[DEBUG] Eliminando archivo antiguo:', oldPdfUri);
        await this.uploadsService.deleteFile(oldPdfUri);
      }
    }

    Object.assign(consent, consentData);
    console.log('[DEBUG] InformedConsentService.update - Entidad después de Object.assign:', JSON.stringify(consent));
    const saved = await this.informedConsentRepository.save(consent);
    console.log('[DEBUG] InformedConsentService.update - Entidad guardada:', JSON.stringify(saved));
    return saved;
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
