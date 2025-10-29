import { MedicalInsurancesService } from '@modules/medical-insurances/medical-insurances.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PatientCreateDto } from '@users/dto';
import { Patient } from '@users/entities/patient.entity';
import argon2 from 'argon2';
import { Repository } from 'typeorm';
import { UserValidationService } from './user-validation.service';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient) private patientRepository: Repository<Patient>,
    private userValidationService: UserValidationService,
    private medicalInsurancesService: MedicalInsurancesService,
  ) {}

  async createPatient(dto: PatientCreateDto): Promise<Patient> {
    await this.userValidationService.ensurePatientUniqueness(dto);

    const passwordHash = await argon2.hash(dto.password);
    const newPatient = this.patientRepository.create({
      ...dto,
      passwordHash,
    });

    if (dto.medicalInsuranceName && dto.insuranceNumber) {
      const medicalInsurance = await this.medicalInsurancesService.findByName(
        dto.medicalInsuranceName,
      );

      if (!medicalInsurance) {
        throw new BadRequestException('Obra social inválida');
      }

      newPatient.medicalInsurance = medicalInsurance;
      newPatient.coverageMemberId = dto.insuranceNumber;
    }

    return this.patientRepository.save(newPatient);
  }

  async getPatients(): Promise<Patient[]> {
    return this.patientRepository.find();
  }

  async findOneByDni(dni: string): Promise<Patient | null> {
    return this.patientRepository.findOne({ where: { dni } });
  }

  async findPatientById(id: number): Promise<Patient | null> {
    return this.patientRepository.findOne({ where: { id } });
  }
}
