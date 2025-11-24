import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalCoverage } from '../entities/medical-coverage.entity';

@Injectable()
export class MedicalCoverageService {
  constructor(
    @InjectRepository(MedicalCoverage)
    private readonly coverageRepository: Repository<MedicalCoverage>,
  ) {}

  async findByTreatmentId(treatmentId: number): Promise<MedicalCoverage | null> {
    return this.coverageRepository.findOne({
      where: { treatment: { id: treatmentId } },
      relations: ['treatment', 'medicalInsurance'],
    });
  }

  async findOne(id: number): Promise<MedicalCoverage> {
    const coverage = await this.coverageRepository.findOne({
      where: { id },
      relations: ['treatment', 'medicalInsurance'],
    });

    if (!coverage) {
      throw new NotFoundException(`Medical coverage with ID ${id} not found`);
    }

    return coverage;
  }

  async create(coverageData: Partial<MedicalCoverage>): Promise<MedicalCoverage> {
    const coverage = this.coverageRepository.create(coverageData);
    return this.coverageRepository.save(coverage);
  }

  async update(
    id: number,
    coverageData: Partial<MedicalCoverage>,
  ): Promise<MedicalCoverage> {
    const coverage = await this.findOne(id);
    Object.assign(coverage, coverageData);
    return this.coverageRepository.save(coverage);
  }

  async remove(id: number): Promise<void> {
    const coverage = await this.findOne(id);
    await this.coverageRepository.remove(coverage);
  }
}
