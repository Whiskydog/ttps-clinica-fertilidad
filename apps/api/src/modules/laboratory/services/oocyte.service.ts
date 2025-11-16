import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Oocyte } from '../entities/oocyte.entity';
import { OocyteState } from '@repo/contracts';

@Injectable()
export class OocyteService {
  constructor(
    @InjectRepository(Oocyte)
    private readonly oocyteRepository: Repository<Oocyte>,
  ) {}

  async findByPunctureRecordId(punctureRecordId: number): Promise<Oocyte[]> {
    return this.oocyteRepository.find({
      where: { puncture: { id: punctureRecordId } },
      relations: ['puncture'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCurrentState(state: OocyteState): Promise<Oocyte[]> {
    return this.oocyteRepository.find({
      where: { currentState: state },
      relations: ['puncture'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Oocyte> {
    const oocyte = await this.oocyteRepository.findOne({
      where: { id },
      relations: ['puncture'],
    });

    if (!oocyte) {
      throw new NotFoundException(`Oocyte with ID ${id} not found`);
    }

    return oocyte;
  }

  async create(oocyteData: Partial<Oocyte>): Promise<Oocyte> {
    const oocyte = this.oocyteRepository.create(oocyteData);
    return this.oocyteRepository.save(oocyte);
  }

  async update(id: number, oocyteData: Partial<Oocyte>): Promise<Oocyte> {
    const oocyte = await this.findOne(id);
    Object.assign(oocyte, oocyteData);
    return this.oocyteRepository.save(oocyte);
  }

  async remove(id: number): Promise<void> {
    const oocyte = await this.findOne(id);
    await this.oocyteRepository.remove(oocyte);
  }
}
