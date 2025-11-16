import { MedicalInsurancesService } from '@modules/medical-insurances/medical-insurances.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PatientCreateDto } from '@users/dto';
import { Patient } from '@users/entities/patient.entity';
import { PatientsQuery } from '@repo/contracts';
import argon2 from 'argon2';
import { Repository, Like } from 'typeorm';
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

    const saved = await this.patientRepository.save(newPatient);

    // Recargá el paciente guardado para que las relaciones eager (role, medicalInsurance)
    // y los campos de fecha se devuelvan con los tipos correctos (Date) y se conserven los nulls.
    return this.patientRepository.findOne({ where: { id: saved.id } });
  }

  async getPatients(query: PatientsQuery) {
    const { page, limit, dni } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.patientRepository
      .createQueryBuilder('patient')
      .leftJoinAndSelect('patient.medicalInsurance', 'medicalInsurance')
      .leftJoinAndSelect('patient.role', 'role');

    // Solo pacientes que tienen una historia clínica (medical_histories.patient_id = patient.id)
    queryBuilder.innerJoin(
      'medical_histories',
      'mh',
      'mh.patient_id = patient.id',
    );

    if (dni) {
      queryBuilder.where('patient.dni LIKE :dni', { dni: `%${dni}%` });
    }

    const [patients, total] = await queryBuilder
      .skip(skip)
      .take(Number(limit))
      .getManyAndCount();

    const totalPages = Math.ceil(total / Number(limit));
    return {
      statusCode: 200,
      message: 'OK',
      data: patients.map((p) => ({
        ...p,
        dateOfBirth:
          p.dateOfBirth instanceof Date
            ? p.dateOfBirth.toISOString().slice(0, 10)
            : p.dateOfBirth,
        medicalInsuranceName: p.medicalInsurance?.name ?? null,
        insuranceNumber: p.coverageMemberId ?? null,
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1,
      },
    };
  }

  async findOneByDni(dni: string): Promise<Patient | null> {
    return this.patientRepository.findOne({ where: { dni } });
  }

  async findPatientById(id: number): Promise<Patient | null> {
    return this.patientRepository.findOne({ where: { id } });
  }
}
