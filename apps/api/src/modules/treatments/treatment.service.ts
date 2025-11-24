import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Treatment } from './entities/treatment.entity';
import { TreatmentStatus, InitialObjective } from '@repo/contracts';
import { MedicalHistory } from '../medical-history/entities/medical-history.entity';
import { CreateTreatmentDto, UpdateTreatmentDto } from './dto';
import { parseDateFromString } from '@common/utils/date.utils';

@Injectable()
export class TreatmentService {
  constructor(
    @InjectRepository(Treatment)
    private readonly treatmentRepo: Repository<Treatment>,
  ) {}

  async createTreatment(
    medicalHistory: MedicalHistory,
    dto: CreateTreatmentDto,
    doctorId: number,
  ) {
    const initialObjective = (dto as any).initial_objective as InitialObjective;

    const treatment = this.treatmentRepo.create({
      initialObjective,
      startDate: new Date(),
      initialDoctor: { id: Number(doctorId) },
      status: TreatmentStatus.vigente,
      closureReason: null,
      closureDate: null,
      medicalHistory,
    });
    return this.treatmentRepo.save(treatment);
  }

  async findByMedicalHistoryId(medicalHistoryId: number) {
    return this.treatmentRepo.find({
      where: { medicalHistory: { id: medicalHistoryId } },
    });
  }

  async update(id: number, dto: UpdateTreatmentDto): Promise<Treatment> {
    const treatment = await this.treatmentRepo.findOne({
      where: { id },
    });

    if (!treatment) {
      throw new NotFoundException('Tratamiento no encontrado');
    }

    if (dto.initialObjective !== undefined) {
      treatment.initialObjective = dto.initialObjective as InitialObjective;
    }
    if (dto.startDate !== undefined) {
      treatment.startDate = parseDateFromString(dto.startDate);
    }
    if (dto.status !== undefined) {
      treatment.status = dto.status as TreatmentStatus;
    }
    if (dto.closureReason !== undefined) {
      treatment.closureReason = dto.closureReason;
    }
    if (dto.closureDate !== undefined) {
      treatment.closureDate = parseDateFromString(dto.closureDate);
    }

    return await this.treatmentRepo.save(treatment);
  }
}
