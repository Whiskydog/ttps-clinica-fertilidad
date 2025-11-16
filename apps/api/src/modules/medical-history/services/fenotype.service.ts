import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fenotype } from '../entities/fenotype.entity';

@Injectable()
export class FenotypeService {
  constructor(
    @InjectRepository(Fenotype)
    private readonly fenotypeRepository: Repository<Fenotype>,
  ) {}

  async findByMedicalHistoryId(medicalHistoryId: number): Promise<Fenotype[]> {
    return this.fenotypeRepository.find({
      where: { medicalHistory: { id: medicalHistoryId } },
      relations: ['partnerData'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPatientFenotype(medicalHistoryId: number): Promise<Fenotype | null> {
    return this.fenotypeRepository.findOne({
      where: {
        medicalHistory: { id: medicalHistoryId },
        partnerData: null,
      },
    });
  }

  async findPartnerFenotype(
    medicalHistoryId: number,
    partnerDataId: number,
  ): Promise<Fenotype | null> {
    return this.fenotypeRepository.findOne({
      where: {
        medicalHistory: { id: medicalHistoryId },
        partnerData: { id: partnerDataId },
      },
      relations: ['partnerData'],
    });
  }

  async findOne(id: number): Promise<Fenotype> {
    const fenotype = await this.fenotypeRepository.findOne({
      where: { id },
      relations: ['medicalHistory', 'partnerData'],
    });

    if (!fenotype) {
      throw new NotFoundException(`Fenotype con ID ${id} no encontrado`);
    }

    return fenotype;
  }

  async create(fenotypeData: Partial<Fenotype>): Promise<Fenotype> {
    const fenotype = this.fenotypeRepository.create(fenotypeData);
    return this.fenotypeRepository.save(fenotype);
  }

  async update(id: number, fenotypeData: Partial<Fenotype>): Promise<Fenotype> {
    const fenotype = await this.findOne(id);
    Object.assign(fenotype, fenotypeData);
    return this.fenotypeRepository.save(fenotype);
  }

  async remove(id: number): Promise<void> {
    const fenotype = await this.findOne(id);
    await this.fenotypeRepository.remove(fenotype);
  }
}
