import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from '@users/entities/patient.entity';
import { Not, Repository } from 'typeorm';
import { PatientCreateDto } from '@users/dto';
import argon2 from 'argon2';
import { BiologicalSex, RoleCode } from '@repo/contracts';
import { Role } from '@users/entities/role.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient) private patientRepository: Repository<Patient>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
  ) {}

  async createPatient(dto: PatientCreateDto): Promise<Patient> {
    const passwordHash = await argon2.hash(dto.password);
    const patientRole = await this.roleRepo.findOne({
      where: { code: RoleCode.PATIENT },
    });

    const newPatient = this.patientRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone ?? '1234567890',
      passwordHash,
      isActive: true,
      role: patientRole!,
      dni: dto.dni,
      dateOfBirth: dto.dateOfBirth,
      occupation: dto.occupation,
      biologicalSex: dto.biologicalSex as BiologicalSex,
      medicalInsuranceId: null,
      coverageMemberId: null,
    });
    return this.patientRepository.save(newPatient);
  }

  async getPatients(): Promise<Patient[]> {
    return this.patientRepository.find();
  }

  // Helpers for inter-service consumption
  async findPatientById(id: number): Promise<Patient | null> {
    return this.patientRepository.findOne({ where: { id } });
  }

  // STI compatibility: in STI, the patient's id IS the user id.
  async findPatientByUserId(userId: number): Promise<Patient | null> {
    return this.patientRepository.findOne({ where: { id: userId } });
  }

  async findDuplicateDni(
    dni: string,
    excludeUserId: number,
  ): Promise<Patient | null> {
    return this.patientRepository.findOne({
      where: { dni, id: Not(excludeUserId) as any },
    });
  }

  async findNameDobDuplicate(
    firstName: string,
    lastName: string,
    dob: Date,
    excludeUserId: number,
  ): Promise<Patient | null> {
    return this.patientRepository
      .createQueryBuilder('p')
      .where(
        'p.first_name = :fn AND p.last_name = :ln AND p.date_of_birth = :dob AND p.id != :uid',
        {
          fn: firstName,
          ln: lastName,
          dob,
          uid: excludeUserId,
        },
      )
      .getOne();
  }
}
