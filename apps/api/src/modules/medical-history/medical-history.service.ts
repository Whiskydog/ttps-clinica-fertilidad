import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalHistory } from './entities/medical-history.entity';
import { AuditService } from '../audit/audit.service';
import { ConfigService } from '@nestjs/config';
import { PatientsService } from '../users/services/patients.service';
import type { Patient } from '../users/entities/patient.entity';

@Injectable()
export class MedicalHistoryService {
  constructor(
    @InjectRepository(MedicalHistory)
    private readonly medicalHistoryRepo: Repository<MedicalHistory>,
    private readonly patientsService: PatientsService,
    private readonly auditService: AuditService,
    private readonly config: ConfigService,
  ) {}

  async findByUserId(userId: number) {
    const patient = await this.patientsService.findPatientByUserId(userId);
    if (!patient) return null;
    return this.medicalHistoryRepo.findOne({
      where: { patient: { id: patient.id } },
      relations: ['patient'],
    });
  }

  async findById(id: number) {
    return this.medicalHistoryRepo.findOne({ where: { id } });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createForPatient(_patientExternalId: number) {
    // Modo tolerante: si aún no existe el esquema de usuarios/pacientes o no hay paciente con ese id,
    // podemos crear un paciente "placeholder" y luego la HC.
    const allowFallback =
      this.config.get<string>('ALLOW_HC_CREATE_WITHOUT_PATIENT') === 'true';
    let patient: Patient | null = null;

    if (!patient && !allowFallback) {
      throw new ConflictException('Paciente no encontrado');
    }
    // Si no existe el paciente y está permitido el fallback, generamos un paciente/usuario placeholder.
    if (!patient && allowFallback) {
      const newPatient = await this.patientsService.createPlaceholderPatient();
      patient = newPatient;
      await this.auditService.log(
        'users',
        newPatient.user.id,
        'creation',
        null,
        'placeholder-created',
        null,
        'system',
      );
    }

    // Crear HC apuntando al paciente existente o recién generado
    const effectivePatient = patient ? patient : null;
    if (!effectivePatient) {
      throw new ConflictException(
        'No se pudo resolver el paciente para crear la HC',
      );
    }
    const hc = this.medicalHistoryRepo.create({ patient: effectivePatient });
    const saved = await this.medicalHistoryRepo.save(hc);
    await this.auditService.log(
      'medical_histories',
      saved.id,
      'creation',
      null,
      'created',
      effectivePatient.user ? effectivePatient.user.id : null,
      effectivePatient.user ? 'patient' : 'system',
    );
    return saved;
  }
}
