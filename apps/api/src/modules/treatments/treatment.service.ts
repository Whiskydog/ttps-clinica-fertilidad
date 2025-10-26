import { ConflictException, Injectable } from '@nestjs/common';
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
  ) {
    const status = (dto.status as TreatmentStatus) ?? TreatmentStatus.vigente;
    if (status === TreatmentStatus.closed && !dto.closure_reason) {
      throw new ConflictException(
        'closure_reason es obligatorio si status = closed',
      );
    }
    const initialObjective = dto.initial_objective as InitialObjective;

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
