import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyResult } from '../entities/study-result.entity';
import { UploadsService } from '@modules/uploads/uploads.service';

@Injectable()
export class StudyResultService {
  constructor(
    @InjectRepository(StudyResult)
    private readonly studyResultRepository: Repository<StudyResult>,
    private readonly uploadsService: UploadsService,
  ) {}

  async findByMedicalOrderId(medicalOrderId: number): Promise<StudyResult[]> {
    return this.studyResultRepository.find({
      where: { medicalOrder: { id: medicalOrderId } },
      relations: ['medicalOrder', 'transcribedByLabTechnician'],
      order: { transcriptionDate: 'DESC' },
    });
  }

  async findOne(id: number): Promise<StudyResult> {
    const result = await this.studyResultRepository.findOne({
      where: { id },
      relations: ['medicalOrder', 'transcribedByLabTechnician'],
    });

    if (!result) {
      throw new NotFoundException(`Study result with ID ${id} not found`);
    }

    return result;
  }

  async create(resultData: Partial<StudyResult>): Promise<StudyResult> {
    console.log('[DEBUG] StudyResultService.create - Datos recibidos:', JSON.stringify(resultData));
    const result = this.studyResultRepository.create(resultData);
    console.log('[DEBUG] StudyResultService.create - Entidad creada:', JSON.stringify(result));
    const saved = await this.studyResultRepository.save(result);
    console.log('[DEBUG] StudyResultService.create - Entidad guardada:', JSON.stringify(saved));
    return saved;
  }

  async update(
    id: number,
    resultData: Partial<StudyResult>,
  ): Promise<StudyResult> {
    console.log('[DEBUG] StudyResultService.update - ID:', id);
    console.log('[DEBUG] StudyResultService.update - Datos recibidos:', JSON.stringify(resultData));
    const result = await this.findOne(id);
    console.log('[DEBUG] StudyResultService.update - Entidad encontrada antes del update:', JSON.stringify(result));

    // Si se está actualizando el originalPdfUri y es diferente al actual, eliminar el archivo viejo
    if ('originalPdfUri' in resultData) {
      const oldPdfUri = result.originalPdfUri;
      const newPdfUri = resultData.originalPdfUri;

      // Si el nuevo URI es diferente al antiguo (o es null), eliminar el archivo viejo
      if (oldPdfUri && oldPdfUri !== newPdfUri) {
        console.log('[DEBUG] Eliminando archivo antiguo:', oldPdfUri);
        await this.uploadsService.deleteFile(oldPdfUri);
      }
    }

    Object.assign(result, resultData);
    console.log('[DEBUG] StudyResultService.update - Entidad después de Object.assign:', JSON.stringify(result));
    const saved = await this.studyResultRepository.save(result);
    console.log('[DEBUG] StudyResultService.update - Entidad guardada:', JSON.stringify(saved));
    return saved;
  }

  async remove(id: number): Promise<void> {
    const result = await this.findOne(id);

    // Eliminar el archivo asociado si existe
    if (result.originalPdfUri) {
      await this.uploadsService.deleteFile(result.originalPdfUri);
    }

    await this.studyResultRepository.remove(result);
  }
}
