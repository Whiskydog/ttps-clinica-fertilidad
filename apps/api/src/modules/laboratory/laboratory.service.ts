import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PunctureRecord } from './entities/puncture-record.entity';
import { Oocyte } from './entities/oocyte.entity';
import { OocyteStateHistory } from './entities/oocyte-state-history.entity';
import { Embryo } from './entities/embryo.entity';
import { Treatment } from '@modules/treatments/entities/treatment.entity';
import { Patient } from '@users/entities/patient.entity';
import { OocyteState } from '@repo/contracts';

@Injectable()
export class LaboratoryService {
  constructor(
    @InjectRepository(PunctureRecord)
    private punctureRecordRepository: Repository<PunctureRecord>,
    @InjectRepository(Oocyte)
    private oocyteRepository: Repository<Oocyte>,
    @InjectRepository(OocyteStateHistory)
    private oocyteStateHistoryRepository: Repository<OocyteStateHistory>,
    @InjectRepository(Embryo)
    private embryoRepository: Repository<Embryo>,
    @InjectRepository(Treatment)
    private treatmentRepository: Repository<Treatment>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    private httpService: HttpService,
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

  async getCompatibleSemenId(phenotypeData: any): Promise<string> {
    const groupNumber = process.env.GROUP_NUMBER || '1';
    const url = `${process.env.GAMETE_BANK_URL}/gametos-compatibilidad`;
    const response = await firstValueFrom(
      this.httpService.post(url, { group: groupNumber, ...phenotypeData }),
    );
    return response.data.donationId;
  }

  async markSemenAsUsed(phenotype: any): Promise<string | null> {
    const groupNumber = process.env.GROUP_NUMBER || '7';
    const url = `${process.env.GAMETE_BANK_URL}/gametos-compatibilidad`;
    try {
      const response = await firstValueFrom(
        this.httpService.post(url, {
          group_number: Number(groupNumber),
          type: 'esperma',
          phenotype: phenotype,
        }),
      );
      console.log(response);
      if (response.data.success && response.data.gamete) {
        return response.data.gamete.id;
      }
      return null;
    } catch (error) {
      console.error('Error marking semen as used:', error);
      return null;
    }
  }

  async cryopreserveOocyte(
    oocyteId: number,
  ): Promise<{ tank: string; rack: string }> {
    const oocyte = await this.oocyteRepository.findOne({
      where: { id: oocyteId },
      relations: [
        'puncture',
        'puncture.treatment',
        'puncture.treatment.medicalHistory',
        'puncture.treatment.medicalHistory.patient',
      ],
    });
    if (!oocyte) throw new NotFoundException('Oocyte not found');
    if (oocyte.currentState !== OocyteState.MATURE) {
      throw new BadRequestException(
        'Solo se pueden criopreservar ovocitos maduros',
      );
    }
    // Llamar al servicio externo de criopreservación
    const url = `${process.env.OOCYTE_BANK_URL}/assign-ovocyte`;
    const response = await firstValueFrom(
      this.httpService.post(url, {
        nro_grupo: '7',
        ovocito_id: oocyte.uniqueIdentifier,
      }),
    );
    const data = response.data[0]; // respuesta es array
    const { tanque_id, rack_id, posicion_id } = data;
    oocyte.isCryopreserved = true;
    oocyte.cryoTank = tanque_id.toString();
    oocyte.cryoRack = rack_id.toString();
    oocyte.cryoTube = posicion_id.toString();
    await this.oocyteRepository.save(oocyte);
    return { tank: tanque_id.toString(), rack: rack_id.toString() };
  }

  async findTreatmentsByPatientDni(dni: string): Promise<Treatment[]> {
    const patient = await this.patientRepository.findOne({ where: { dni } });
    if (!patient) return [];
    return this.treatmentRepository
      .createQueryBuilder('treatment')
      .leftJoinAndSelect('treatment.medicalHistory', 'medicalHistory')
      .leftJoinAndSelect('medicalHistory.patient', 'patient')
      .where('patient.id = :patientId', { patientId: patient.id })
      .getMany();
  }

  async findAllPunctureRecords(
    page: number = 1,
    limit: number = 10,
  ): Promise<PunctureRecord[]> {
    const skip = (page - 1) * limit;
    return this.punctureRecordRepository.find({
      relations: [
        'treatment',
        'treatment.medicalHistory',
        'treatment.medicalHistory.patient',
        'labTechnician',
      ],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
  }

  async findAllOocytes(
    page: number = 1,
    limit: number = 10,
  ): Promise<Oocyte[]> {
    const skip = (page - 1) * limit;
    return this.oocyteRepository.find({
      relations: [
        'puncture',
        'puncture.treatment',
        'puncture.treatment.medicalHistory',
        'puncture.treatment.medicalHistory.patient',
      ],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
  }

  async findMatureNonCryopreservedOocytes(): Promise<Oocyte[]> {
    return this.oocyteRepository
      .createQueryBuilder('oocyte')
      .leftJoinAndSelect('oocyte.puncture', 'puncture')
      .where('oocyte.currentState = :mature', { mature: OocyteState.MATURE })
      .andWhere('oocyte.isCryopreserved = :false', { false: false })
      .andWhere('oocyte.currentState != :used', { used: OocyteState.USED })
      .orderBy('oocyte.createdAt', 'DESC')
      .getMany();
  }

  // aca CRUD
}
