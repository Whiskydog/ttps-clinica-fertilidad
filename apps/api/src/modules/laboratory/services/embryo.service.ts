import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Embryo } from '../entities/embryo.entity';
import { EmbryoDisposition } from '@repo/contracts';

@Injectable()
export class EmbryoService {
  constructor(
    @InjectRepository(Embryo)
    private readonly embryoRepository: Repository<Embryo>,
  ) {}

  async findOneWithHistory(id: number) {
    const data = await this.embryoRepository.findOne({
      where: { id },
      relations: {
        oocyteOrigin: {
          stateHistory: true,
          puncture: { labTechnician: true },
        },
        technician: true,
      },
    });

    console.log('🧬 RESULT BACKEND =>', JSON.stringify(data, null, 2));
    return data;
  }

  async findByOocyteOriginId(oocyteId: number): Promise<Embryo[]> {
    return this.embryoRepository.find({
      where: { oocyteOrigin: { id: oocyteId } },
      relations: ['oocyteOrigin', 'technician'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByDisposition(
    disposition: EmbryoDisposition,
  ): Promise<Embryo[]> {
    return this.embryoRepository.find({
      where: { finalDisposition: disposition },
      relations: ['oocyteOrigin', 'technician'],
      order: { createdAt: 'DESC' },
    });
  }

  async findCryopreserved(): Promise<Embryo[]> {
    return this.findByDisposition(EmbryoDisposition.CRYOPRESERVED);
  }

  async findOne(id: number) {
    return this.embryoRepository.findOne({
      where: { id },
      relations: {
        oocyteOrigin: {
          puncture: {
            labTechnician: true, 
          },
        },
        technician: true, 
      },
    });
  }

async findByPatientId(patientId: number): Promise<Embryo[]> {
    return this.embryoRepository.find({
      where: {
        oocyteOrigin: {
          puncture: {
            treatment: {
              medicalHistory: {
                patient: {
                  id: patientId,
                },
              },
            },
          },
        },
      },
      relations: ['oocyteOrigin', 'oocyteOrigin.puncture', 'oocyteOrigin.puncture.treatment', 'oocyteOrigin.puncture.treatment.medicalHistory', 'oocyteOrigin.puncture.treatment.medicalHistory.patient'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(embryoData: Partial<Embryo>): Promise<Embryo> {
    const embryo = this.embryoRepository.create(embryoData);
    return this.embryoRepository.save(embryo);
  }

  async update(id: number, embryoData: Partial<Embryo>): Promise<Embryo> {
    const embryo = await this.findOne(id);
    Object.assign(embryo, embryoData);
    return this.embryoRepository.save(embryo);
  }

  async remove(id: number): Promise<void> {
    const embryo = await this.findOne(id);
    await this.embryoRepository.remove(embryo);
  }
}
