import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicationProtocol } from '../entities/medication-protocol.entity';
import { parseDateFromString } from '@common/utils/date.utils';

@Injectable()
export class MedicationProtocolService {
  constructor(
    @InjectRepository(MedicationProtocol)
    private medicationProtocolRepository: Repository<MedicationProtocol>,
  ) {}

  async update(
    id: number,
    data: {
      protocolType?: string;
      drugName?: string;
      dose?: string;
      administrationRoute?: string;
      duration?: string;
      startDate?: string;
      additionalMedication?: string[];
    },
  ): Promise<MedicationProtocol> {
    const protocol = await this.medicationProtocolRepository.findOne({
      where: { id },
    });

    if (!protocol) {
      throw new NotFoundException('Protocolo de medicación no encontrado');
    }

    if (data.protocolType !== undefined) {
      protocol.protocolType = data.protocolType;
    }
    if (data.drugName !== undefined) {
      protocol.drugName = data.drugName;
    }
    if (data.dose !== undefined) {
      protocol.dose = data.dose;
    }
    if (data.administrationRoute !== undefined) {
      protocol.administrationRoute = data.administrationRoute;
    }
    if (data.duration !== undefined) {
      protocol.duration = data.duration;
    }
    if (data.startDate !== undefined) {
      protocol.startDate = data.startDate ? parseDateFromString(data.startDate) : null;
    }
    if (data.additionalMedication !== undefined) {
      protocol.additionalMedication = data.additionalMedication;
    }

    return await this.medicationProtocolRepository.save(protocol);
  }
}
