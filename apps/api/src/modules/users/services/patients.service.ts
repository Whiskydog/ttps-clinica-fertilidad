import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from '@users/entities/patient.entity';
import { Repository } from 'typeorm';
import { PatientCreateDto } from '@users/dto';
import argon2 from 'argon2';
import { UserValidationService } from './user-validation.service';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient) private patientRepository: Repository<Patient>,
    private userValidationService: UserValidationService,
  ) {}

  async createPatient(dto: PatientCreateDto): Promise<Patient> {
    await this.userValidationService.ensurePatientUniqueness(dto);

    const passwordHash = await argon2.hash(dto.password);
    const newPatient = this.patientRepository.create({ ...dto, passwordHash });

    return this.patientRepository.save(newPatient);
  }

  async getPatients(): Promise<Patient[]> {
    return this.patientRepository.find();
  }
}
