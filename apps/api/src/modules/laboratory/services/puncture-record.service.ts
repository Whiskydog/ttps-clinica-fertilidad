import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PunctureRecord } from '../entities/puncture-record.entity';

@Injectable()
export class PunctureRecordService {
  constructor(
    @InjectRepository(PunctureRecord)
    private readonly punctureRecordRepository: Repository<PunctureRecord>,
  ) {}

  async findByTreatmentId(treatmentId: number): Promise<PunctureRecord[]> {
    return this.punctureRecordRepository.find({
      where: { treatment: { id: treatmentId } },
      relations: ['treatment', 'labTechnician'],
      order: { punctureDateTime: 'DESC' },
    });
  }

  async findOne(id: number): Promise<PunctureRecord> {
    const record = await this.punctureRecordRepository.findOne({
      where: { id },
      relations: ['treatment', 'labTechnician'],
    });

    if (!record) {
      throw new NotFoundException(`Puncture record with ID ${id} not found`);
    }

    return record;
  }

  async create(recordData: Partial<PunctureRecord>): Promise<PunctureRecord> {
    const record = this.punctureRecordRepository.create(recordData);
    return this.punctureRecordRepository.save(record);
  }

  async update(
    id: number,
    recordData: Partial<PunctureRecord>,
  ): Promise<PunctureRecord> {
    const record = await this.findOne(id);
    Object.assign(record, recordData);
    return this.punctureRecordRepository.save(record);
  }

  async remove(id: number): Promise<void> {
    const record = await this.findOne(id);
    await this.punctureRecordRepository.remove(record);
  }
}
