import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from '../entities/patient.entity';
import { ValidationException } from '@common/exceptions/validations';
import { Repository } from 'typeorm';
import { ValidationError } from '@repo/contracts';
import { PatientCreateDto } from '../dto';

@Injectable()
export class UserValidationService {
  constructor(
    @InjectRepository(Patient) private patientRepository: Repository<Patient>,
  ) {}

  async ensurePatientUniqueness({
    email,
    dni,
  }: PatientCreateDto): Promise<void> {
    const emailExists = await this.patientRepository.existsBy({ email });
    const dniExists = await this.patientRepository.existsBy({ dni });

    const error = new ValidationError();

    if (emailExists) {
      error.addCustomIssue({
        fieldName: 'email',
        message: 'El email ya está en uso',
      });
    }

    if (dniExists) {
      error.addCustomIssue({
        fieldName: 'dni',
        message: 'El DNI ya está en uso',
      });
    }

    if (error.issues.length > 0) {
      throw new ValidationException(error);
    }
  }
}
