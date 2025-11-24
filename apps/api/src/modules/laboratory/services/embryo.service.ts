import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Embryo } from '../entities/embryo.entity';
import { Oocyte } from '../entities/oocyte.entity';
import { EmbryoDisposition } from '@repo/contracts';

@Injectable()
export class EmbryoService {
  constructor(
    @InjectRepository(Embryo)
    private readonly embryoRepository: Repository<Embryo>,
  ) {}

  generateEmbryoId(
    date: Date,
    lastName: string,
    firstName: string,
    nn: number,
  ): string {
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const apeNom = `${lastName.slice(0, 3).toUpperCase()}${firstName.slice(0, 3).toUpperCase()}`;
    const nnStr = nn.toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `emb_${dateStr}_${apeNom}_${nnStr}_${random}`;
  }

  async findByOocyteOriginId(oocyteId: number): Promise<Embryo[]> {
    return this.embryoRepository.find({
      where: { oocyteOrigin: { id: oocyteId } },
      relations: ['oocyteOrigin', 'technician'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByDisposition(disposition: EmbryoDisposition): Promise<Embryo[]> {
    return this.embryoRepository.find({
      where: { finalDisposition: disposition },
      relations: ['oocyteOrigin', 'technician'],
      order: { createdAt: 'DESC' },
    });
  }

  async findCryopreserved(): Promise<Embryo[]> {
    return this.findByDisposition(EmbryoDisposition.CRYOPRESERVED);
  }

  async findOne(id: number): Promise<Embryo> {
    const embryo = await this.embryoRepository.findOne({
      where: { id },
      relations: ['oocyteOrigin', 'technician'],
    });

    if (!embryo) {
      throw new NotFoundException(`Embryo with ID ${id} not found`);
    }

    return embryo;
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
      relations: [
        'oocyteOrigin',
        'oocyteOrigin.puncture',
        'oocyteOrigin.puncture.treatment',
        'oocyteOrigin.puncture.treatment.medicalHistory',
        'oocyteOrigin.puncture.treatment.medicalHistory.patient',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async create(embryoData: Partial<Embryo>): Promise<Embryo> {
    // Generar uniqueIdentifier automáticamente
    const oocyte = await this.embryoRepository.manager
      .getRepository(Oocyte)
      .findOne({
        where: { id: embryoData.oocyteOrigin!.id },
        relations: [
          'puncture',
          'puncture.treatment',
          'puncture.treatment.medicalHistory',
          'puncture.treatment.medicalHistory.patient',
        ],
      });
    if (!oocyte) {
      throw new NotFoundException('Oocyte not found');
    }
    const patient = oocyte.puncture.treatment.medicalHistory.patient;
    const date = embryoData.fertilizationDate || new Date();
    const lastName = patient.lastName || 'Unknown';
    const firstName = patient.firstName || 'Unknown';
    // Contar embriones existentes para este paciente
    const existingEmbryos = await this.embryoRepository.count({
      where: {
        oocyteOrigin: {
          puncture: {
            treatment: { medicalHistory: { patient: { id: patient.id } } },
          },
        },
      },
    });
    const nn = existingEmbryos + 1;
    const uniqueIdentifier = this.generateEmbryoId(
      date,
      lastName,
      firstName,
      nn,
    );

    const embryo = this.embryoRepository.create({
      ...embryoData,
      uniqueIdentifier,
    });
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
