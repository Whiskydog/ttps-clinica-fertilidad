import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Background } from '../entities/background.entity';
import { BackgroundType } from '@repo/contracts';

@Injectable()
export class BackgroundService {
  constructor(
    @InjectRepository(Background)
    private readonly backgroundRepository: Repository<Background>,
  ) {}

  async findByMedicalHistoryId(medicalHistoryId: number): Promise<Background[]> {
    return this.backgroundRepository.find({
      where: { medicalHistory: { id: medicalHistoryId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findByMedicalHistoryIdAndType(
    medicalHistoryId: number,
    backgroundType: BackgroundType,
  ): Promise<Background[]> {
    return this.backgroundRepository.find({
      where: {
        medicalHistory: { id: medicalHistoryId },
        backgroundType,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Background> {
    const background = await this.backgroundRepository.findOne({
      where: { id },
      relations: ['medicalHistory'],
    });

    if (!background) {
      throw new NotFoundException(`Background con ID ${id} no encontrado`);
    }

    return background;
  }

  async create(backgroundData: Partial<Background>): Promise<Background> {
    const background = this.backgroundRepository.create(backgroundData);
    return this.backgroundRepository.save(background);
  }

  async update(
    id: number,
    backgroundData: Partial<Background>,
  ): Promise<Background> {
    const background = await this.findOne(id);
    Object.assign(background, backgroundData);
    return this.backgroundRepository.save(background);
  }

  async remove(id: number): Promise<void> {
    const background = await this.findOne(id);
    await this.backgroundRepository.remove(background);
  }
}
