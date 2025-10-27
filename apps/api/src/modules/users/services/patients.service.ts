import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from '@users/entities/patient.entity';
import { Repository } from 'typeorm';
import { PatientCreateDto } from '@users/dto';
import argon2 from 'argon2';
import { MedicalInsurance } from '@modules/medical-insurances/entities/medical-insurance.entity';
import { MedicalInsurancesService } from '@modules/medical-insurances/medical-insurances.service';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient) private patientRepository: Repository<Patient>,
    private readonly medicalInsurances: MedicalInsurancesService,
  ) {}

  async createPatient(dto: PatientCreateDto): Promise<Patient> {
    const passwordHash = await argon2.hash(dto.password);

    // Optional obra social (relation) and coverage member
    let medicalInsurance: MedicalInsurance | null = null;
    if (dto.medicalInsuranceId != null) {
      const id = Number(dto.medicalInsuranceId);
      if (!Number.isFinite(id)) {
        throw new BadRequestException(
          'medicalInsuranceId debe ser numérico si se envía',
        );
      }
      const found = await this.medicalInsurances.findById(id);
      if (!found) {
        throw new BadRequestException('Obra social inválida');
      }
      medicalInsurance = found;
    }

    const newPatient = this.patientRepository.create({
      ...dto,
      passwordHash,
      medicalInsurance,
    });
    return this.patientRepository.save(newPatient);
  }

  async getPatients(): Promise<Patient[]> {
    return this.patientRepository.find();
  }

  async findPatientById(id: number): Promise<Patient | null> {
    return this.patientRepository.findOne({ where: { id } });
  }
}
