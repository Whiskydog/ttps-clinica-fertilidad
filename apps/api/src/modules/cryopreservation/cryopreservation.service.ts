import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CryopreservedProduct } from './entities/cryopreserved-product.entity';

@Injectable()
export class CryopreservationService {
  constructor(
    @InjectRepository(CryopreservedProduct)
    private cryoRepository: Repository<CryopreservedProduct>,
  ) {}

  async getSummaryByPatient(patientId: number) {
    const ovules = await this.cryoRepository.find({
      where: { patientId, productType: 'ovule' },
      order: { cryopreservationDate: 'DESC' },
    });

    const embryos = await this.cryoRepository.find({
      where: { patientId, productType: 'embryo' },
      order: { cryopreservationDate: 'DESC' },
    });

    const ovuleSummary = ovules.length > 0
      ? {
          total: ovules.length,
          cryoDate: ovules[0].cryopreservationDate,
        }
      : { total: 0, cryoDate: null };

    const embryoSummary = embryos.length > 0
      ? {
          total: embryos.length,
          lastUpdate: embryos[0].cryopreservationDate,
        }
      : { total: 0, lastUpdate: null };

    return {
      summary: {
        ovules: ovuleSummary,
        embryos: embryoSummary,
      },
      ovules,
      embryos,
    };
  }

  async findByPatient(patientId: number) {
    return await this.cryoRepository.find({
      where: { patientId },
      order: { cryopreservationDate: 'DESC' },
    });
  }

  async findOne(productId: string, patientId: number) {
    const product = await this.cryoRepository.findOne({
      where: { id: Number(productId), patientId },
      relations: ['treatment'],
    });

    if (!product) {
      throw new NotFoundException('Cryopreserved product not found');
    }

    return product;
  }
}
