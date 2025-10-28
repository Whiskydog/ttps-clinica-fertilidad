import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalInsurance } from './entities/medical-insurance.entity';

@Injectable()
export class MedicalInsurancesService {
  constructor(
    @InjectRepository(MedicalInsurance)
    private readonly repo: Repository<MedicalInsurance>,
  ) {}

  findAll(): Promise<MedicalInsurance[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  findById(id: number): Promise<MedicalInsurance | null> {
    return this.repo.findOne({ where: { id } });
  }
}
