import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExternalMedicalInsuranceDetail } from '@repo/contracts';
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

  findByName(name: string): Promise<MedicalInsurance | null> {
    return this.repo.findOneBy({ name });
  }

  async upsertMedicalInsurances(
    externalMedicalInsurances: ExternalMedicalInsuranceDetail[],
  ) {
    const medicalInsurances = await this.findAll();
    const medicalInsurancesMap = new Map(
      medicalInsurances.map((mi) => [mi.externalId, mi]),
    );

    const queryBuilder = this.repo.createQueryBuilder();
    queryBuilder
      .insert()
      .into(MedicalInsurance)
      .values(
        externalMedicalInsurances.map((emi) => {
          const existing = medicalInsurancesMap.get(emi.id);
          return {
            name: emi.nombre,
            acronym: emi.sigla,
            externalId: emi.id,
            id: existing ? existing.id : undefined,
          };
        }),
      )
      .orUpdate(['name', 'acronym', 'updated_at'], ['externalId'])
      .execute();
  }
}
