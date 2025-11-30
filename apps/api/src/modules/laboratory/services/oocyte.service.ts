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

  async findByPatientId(patientId: number): Promise<Oocyte[]> {
    return this.oocyteRepository.find({
      where: {
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
      relations: ['puncture', 'puncture.treatment', 'puncture.treatment.medicalHistory', 'puncture.treatment.medicalHistory.patient'],
      order: { createdAt: 'DESC' },
    });
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

  async findOneWithHistory(id: number) {
    return this.oocyteRepository.findOne({
      where: { id },
      relations: {
        stateHistory: true,
        puncture: {
          labTechnician: true,
          treatment: true,
        },
      },
      order: {
        stateHistory: {
          transitionDate: 'ASC',
        },
      },
    });
  }
}
