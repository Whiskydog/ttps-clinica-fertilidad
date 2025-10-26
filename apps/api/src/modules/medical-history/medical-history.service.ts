import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalHistory } from './entities/medical-history.entity';
import { AuditService } from '../audit/audit.service';
import { PatientsService } from '../users/services/patients.service';

@Injectable()
export class MedicalHistoryService {
  constructor(
    @InjectRepository(MedicalHistory)
    private readonly medicalHistoryRepo: Repository<MedicalHistory>,
    private readonly patientsService: PatientsService,
    private readonly auditService: AuditService,
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

  async createForPatient(patientId: number) {
    // Resuelve el paciente y crea la historia clínica; si no existe el paciente, falla.
    if (!patientId) {
      throw new ConflictException('Paciente no encontrado');
    }

    const patient = await this.patientsService.findPatientById(patientId);
    if (!patient) {
      throw new ConflictException('Paciente no encontrado');
    }

    const hc = this.medicalHistoryRepo.create({ patient });
    const saved = await this.medicalHistoryRepo.save(hc);
    await this.auditService.log(
      'medical_histories',
      saved.id,
      'creation',
      null,
      'created',
      patient.id,
      'patient',
    );
    return saved;
  }
}
