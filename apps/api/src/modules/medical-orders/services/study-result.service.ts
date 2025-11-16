import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyResult } from '../entities/study-result.entity';

@Injectable()
export class StudyResultService {
  constructor(
    @InjectRepository(StudyResult)
    private readonly studyResultRepository: Repository<StudyResult>,
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
    return this.studyResultRepository.save(result);
  }

  async update(
    id: number,
    resultData: Partial<StudyResult>,
  ): Promise<StudyResult> {
    const result = await this.findOne(id);
    Object.assign(result, resultData);
    return this.studyResultRepository.save(result);
  }

  async remove(id: number): Promise<void> {
    const result = await this.findOne(id);
    await this.studyResultRepository.remove(result);
  }
}
