import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
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

  async create(data: {
    treatmentId: number;
    protocolType: string;
    drugName: string;
    dose: string;
    administrationRoute: string;
    duration?: string | null;
    startDate?: string | null;
    additionalMedication?: string[] | null;
  }): Promise<MedicationProtocol> {
    // Check if protocol already exists for this treatment
    const existingProtocol = await this.medicationProtocolRepository.findOne({
      where: { treatmentId: data.treatmentId },
    });

    if (existingProtocol) {
      throw new ConflictException(
        'Ya existe un protocolo de medicación para este tratamiento',
      );
    }

    const protocol = this.medicationProtocolRepository.create({
      treatmentId: data.treatmentId,
      protocolType: data.protocolType,
      drugName: data.drugName,
      dose: data.dose,
      administrationRoute: data.administrationRoute,
      duration: data.duration || null,
      startDate: data.startDate ? parseDateFromString(data.startDate) : null,
      additionalMedication: data.additionalMedication || null,
    });

    return await this.medicationProtocolRepository.save(protocol);
  }

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
