import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Embryo } from '../entities/embryo.entity';
import { Oocyte } from '../entities/oocyte.entity';
import { OocyteStateHistory } from '../entities/oocyte-state-history.entity';
import { EmbryoDisposition, OocyteState } from '@repo/contracts';
import { LaboratoryService } from '../laboratory.service';

@Injectable()
export class EmbryoService {
  constructor(
    @InjectRepository(Embryo)
    private readonly embryoRepository: Repository<Embryo>,
    @InjectRepository(Oocyte)
    private readonly oocyteRepository: Repository<Oocyte>,
    @InjectRepository(OocyteStateHistory)
    private readonly oocyteStateHistoryRepository: Repository<OocyteStateHistory>,
    private readonly laboratoryService: LaboratoryService,
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

  async create(
    embryoData: Partial<Embryo>,
    donationPhenotype?: any,
  ): Promise<Embryo> {
    // Si es semen donado, marcar como utilizado en el banco externo
    if (embryoData.semenSource === 'donated' && donationPhenotype) {
      const reservedId =
        await this.laboratoryService.markSemenAsUsed(donationPhenotype);
      if (reservedId) {
        embryoData.donationIdUsed = reservedId;
      }
    }

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
    const savedEmbryo = await this.embryoRepository.save(embryo);

    // Marcar el ovocito como usado
    const originOocyte = await this.oocyteRepository.findOne({ where: { id: embryoData.oocyteOrigin!.id } });
    if (originOocyte) {
      const oldState = originOocyte.currentState;
      originOocyte.currentState = OocyteState.USED;
      await this.oocyteRepository.save(originOocyte);
      await this.oocyteStateHistoryRepository.save({
        oocyte: originOocyte,
        previousState: oldState,
        newState: OocyteState.USED,
        transitionDate: new Date(),
      });
    }

    return savedEmbryo;
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

  async findPaginated(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ embryos: Embryo[]; total: number }> {
    const [embryos, total] = await this.embryoRepository.findAndCount({
      relations: ['oocyteOrigin', 'technician'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { embryos, total };
  }

  async cryopreserve(
    id: number,
    tank: string,
    rack: string,
    tube: string,
  ): Promise<Embryo> {
    const embryo = await this.findOne(id);
    embryo.finalDisposition = EmbryoDisposition.CRYOPRESERVED;
    embryo.cryoTank = tank;
    embryo.cryoRack = rack;
    embryo.cryoTube = tube;
    return this.embryoRepository.save(embryo);
  }

  async transfer(id: number): Promise<Embryo> {
    const embryo = await this.findOne(id);
    embryo.finalDisposition = EmbryoDisposition.TRANSFERRED;
    return this.embryoRepository.save(embryo);
  }

  async discard(id: number, cause: string): Promise<Embryo> {
    const embryo = await this.findOne(id);
    embryo.finalDisposition = EmbryoDisposition.DISCARDED;
    embryo.discardCause = cause;
    return this.embryoRepository.save(embryo);
  }
}
