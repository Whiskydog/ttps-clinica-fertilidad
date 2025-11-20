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
    const result = this.studyResultRepository.create(resultData);
    return await this.studyResultRepository.save(result);
  }

  async update(
    id: number,
    resultData: Partial<StudyResult>,
  ): Promise<StudyResult> {
    const result = await this.findOne(id);

    // Si se está actualizando el originalPdfUri y es diferente al actual, eliminar el archivo viejo
    if ('originalPdfUri' in resultData) {
      const oldPdfUri = result.originalPdfUri;
      const newPdfUri = resultData.originalPdfUri;

      if (oldPdfUri && oldPdfUri !== newPdfUri) {
        await this.uploadsService.deleteFile(oldPdfUri);
      }
    }

    Object.assign(result, resultData);
    return await this.studyResultRepository.save(result);
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
