import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Treatment,
  TreatmentStatus,
  InitialObjective,
} from './entities/treatment.entity';
import { MedicalHistory } from '../medical-history/entities/medical-history.entity';
import { CreateTreatmentDto } from './dto/create-treatment.dto';

@Injectable()
export class TreatmentService {
  constructor(
    @InjectRepository(Treatment)
    private readonly treatmentRepo: Repository<Treatment>,
  ) {}

  async createTreatment(
    medicalHistory: MedicalHistory,
    dto: CreateTreatmentDto,
  ) {
    const status = (dto.status as TreatmentStatus) ?? TreatmentStatus.vigente;
    if (!Object.values(TreatmentStatus).includes(status)) {
      throw new ConflictException('status inválido');
    }
    if (status === TreatmentStatus.closed && !dto.closure_reason) {
      throw new ConflictException(
        'closure_reason es obligatorio si status = closed',
      );
    }
    const initialObjective = dto.initial_objective as InitialObjective;
    if (!Object.values(InitialObjective).includes(initialObjective)) {
      throw new ConflictException('initial_objective inválido');
    }

    const treatment = this.treatmentRepo.create({
      initialObjective,
      startDate: dto.start_date,
      initialDoctorId: dto.initial_doctor_id,
      status,
      closureReason: dto.closure_reason,
      closureDate: dto.closure_date,
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
