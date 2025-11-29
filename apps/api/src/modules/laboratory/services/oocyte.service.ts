import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Oocyte } from '../entities/oocyte.entity';
import { PunctureRecord } from '../entities/puncture-record.entity';
import { OocyteState } from '@repo/contracts';
import { OocyteStateHistoryService } from './oocyte-state-history.service';

@Injectable()
export class OocyteService {
  constructor(
    @InjectRepository(Oocyte)
    private readonly oocyteRepository: Repository<Oocyte>,
    private readonly oocyteStateHistoryService: OocyteStateHistoryService,
  ) {}

  generateOocyteId(
    date: Date,
    lastName: string,
    firstName: string,
    nn: number,
  ): string {
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const apeNom = `${lastName.slice(0, 3).toUpperCase()}${firstName.slice(0, 3).toUpperCase()}`;
    const nnStr = nn.toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `ovo_${dateStr}_${apeNom}_${nnStr}_${random}`;
  }

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
      relations: [
        'puncture',
        'puncture.treatment',
        'puncture.treatment.medicalHistory',
        'puncture.treatment.medicalHistory.patient',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async create(oocyteData: Partial<Oocyte>): Promise<Oocyte> {
    // Generar uniqueIdentifier automáticamente
    const puncture = await this.oocyteRepository.manager
      .getRepository(PunctureRecord)
      .findOne({
        where: { id: oocyteData.puncture!.id },
        relations: [
          'treatment',
          'treatment.medicalHistory',
          'treatment.medicalHistory.patient',
        ],
      });
    if (!puncture) {
      throw new NotFoundException('Puncture record not found');
    }
    const patient = puncture.treatment.medicalHistory.patient;
    let date = puncture.punctureDateTime;
    if (!date) date = new Date();
    const lastName = patient.lastName || 'Unknown';
    const firstName = patient.firstName || 'Unknown';
    // Contar ovocitos existentes para este paciente
    const existingOocytes = await this.oocyteRepository.count({
      where: {
        puncture: {
          treatment: { medicalHistory: { patient: { id: patient.id } } },
        },
      },
    });
    const nn = existingOocytes + 1;
    const uniqueIdentifier = this.generateOocyteId(
      date,
      lastName,
      firstName,
      nn,
    );

    const oocyte = this.oocyteRepository.create({
      ...oocyteData,
      uniqueIdentifier,
    });
    return this.oocyteRepository.save(oocyte);
  }

  async update(id: number, oocyteData: Partial<Oocyte>): Promise<Oocyte> {
    const oocyte = await this.findOne(id);
    if (
      oocyte.currentState === OocyteState.DISCARDED &&
      oocyteData.currentState
    ) {
      throw new BadRequestException(
        'No se puede cambiar el estado de un ovocito descartado',
      );
    }
    const oldState = oocyte.currentState;
    Object.assign(oocyte, oocyteData);
    if (oocyteData.currentState && oocyteData.currentState !== oldState) {
      await this.oocyteStateHistoryService.create({
        oocyte: oocyte,
        previousState: oldState,
        newState: oocyteData.currentState,
        transitionDate: new Date(),
      });
    }
    return this.oocyteRepository.save(oocyte);
  }

  async remove(id: number): Promise<void> {
    const oocyte = await this.findOne(id);
    await this.oocyteRepository.remove(oocyte);
  }

  async discard(id: number, cause: string): Promise<void> {
    if (!cause) throw new BadRequestException('Causa de descarte obligatoria');
    const oocyte = await this.findOne(id);
    const oldState = oocyte.currentState;
    oocyte.currentState = OocyteState.DISCARDED;
    oocyte.discardCause = cause;
    oocyte.discardDateTime = new Date();
    await this.oocyteRepository.save(oocyte);
    await this.oocyteStateHistoryService.create({
      oocyte: oocyte,
      previousState: oldState,
      newState: OocyteState.DISCARDED,
      transitionDate: new Date(),
      cause: cause,
    });
  }

  async cultivate(id: number, cultivationDate: Date): Promise<void> {
    const oocyte = await this.findOne(id);
    if (oocyte.currentState !== OocyteState.VERY_IMMATURE) {
      throw new BadRequestException(
        'Solo se pueden cultivar ovocitos muy inmaduros',
      );
    }
    const oldState = oocyte.currentState;
    oocyte.currentState = OocyteState.CULTIVATED;
    await this.oocyteRepository.save(oocyte);
    await this.oocyteStateHistoryService.create({
      oocyte: oocyte,
      previousState: oldState,
      newState: OocyteState.CULTIVATED,
      transitionDate: new Date(),
    });
  }
}
