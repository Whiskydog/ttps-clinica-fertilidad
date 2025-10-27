import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from '../entities/patient.entity';
import { ValidationException } from '@common/exceptions/validations';
import { Repository } from 'typeorm';

@Injectable()
export class UserValidationService {
  constructor(
    @InjectRepository(Patient) private patientRepository: Repository<Patient>,
  ) {}

  async ensureEmailUniqueness(email: string): Promise<void> {
    if (await this.patientRepository.existsBy({ email })) {
      throw new ValidationException({
        fieldName: 'email',
        message: 'Ya existe un paciente con este email',
      });
    }
  }

  async ensureDniUniqueness(dni: string): Promise<void> {
    if (await this.patientRepository.existsBy({ dni })) {
      throw new ValidationException({
        fieldName: 'dni',
        message: 'Ya existe un paciente con este DNI',
      });
    }
  }
}
