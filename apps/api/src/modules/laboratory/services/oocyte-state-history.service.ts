import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OocyteStateHistory } from '../entities/oocyte-state-history.entity';

@Injectable()
export class OocyteStateHistoryService {
  constructor(
    @InjectRepository(OocyteStateHistory)
    private readonly stateHistoryRepository: Repository<OocyteStateHistory>,
  ) {}

  async findByOocyteId(oocyteId: number): Promise<OocyteStateHistory[]> {
    return this.stateHistoryRepository.find({
      where: { oocyte: { id: oocyteId } },
      relations: ['oocyte'],
      order: { transitionDate: 'ASC' },
    });
  }

  async findOne(id: number): Promise<OocyteStateHistory> {
    const history = await this.stateHistoryRepository.findOne({
      where: { id },
      relations: ['oocyte'],
    });

    if (!history) {
      throw new NotFoundException(
        `Historial de estado de ovocito con ID ${id} no encontrado`,
      );
    }

    return history;
  }

  async create(
    historyData: Partial<OocyteStateHistory>,
  ): Promise<OocyteStateHistory> {
    const history = this.stateHistoryRepository.create(historyData);
    return this.stateHistoryRepository.save(history);
  }

  async update(
    id: number,
    historyData: Partial<OocyteStateHistory>,
  ): Promise<OocyteStateHistory> {
    const history = await this.findOne(id);
    Object.assign(history, historyData);
    return this.stateHistoryRepository.save(history);
  }

  async remove(id: number): Promise<void> {
    const history = await this.findOne(id);
    await this.stateHistoryRepository.remove(history);
  }
}
