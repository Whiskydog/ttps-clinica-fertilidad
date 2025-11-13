import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from '../entities/patient.entity';
import { User } from '../entities/user.entity';
import { ValidationException } from '@common/exceptions/validations';
import { Repository } from 'typeorm';
import { ValidationError } from '@repo/contracts';
import { PatientCreateDto } from '../dto';

@Injectable()
export class UserValidationService {
  constructor(
    @InjectRepository(Patient) private patientRepository: Repository<Patient>,
    @InjectRepository(User) private userRepository: Repository<User>,
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

  async ensureStaffUserUniqueness({
    email,
  }: {
    email: string;
  }): Promise<void> {
    // Validar en la tabla base de users (email debe ser único en toda la aplicación)
    const emailExists = await this.userRepository.existsBy({ email });

    const error = new ValidationError();

    if (emailExists) {
      error.addCustomIssue({
        fieldName: 'email',
        message: 'El email ya está en uso',
      });
    }

    if (error.issues.length > 0) {
      throw new ValidationException(error);
    }
  }
}
