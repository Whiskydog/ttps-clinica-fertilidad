import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Treatment } from './entities/treatment.entity';
import { TreatmentStatus, InitialObjective } from '@repo/contracts';
import { MedicalHistory } from '../medical-history/entities/medical-history.entity';
import { CreateTreatmentDto } from './dto';

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
}
