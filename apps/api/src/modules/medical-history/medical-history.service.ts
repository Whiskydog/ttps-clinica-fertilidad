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
    const patient = await this.patientsService.findPatientById(userId);
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
    // Crear HC solo si el paciente existe y aún no tiene una HC asociada
    const patient = await this.patientsService.findPatientById(patientId);
    if (!patient) {
      throw new ConflictException('Paciente no encontrado');
    }

    const already = await this.medicalHistoryRepo.findOne({
      where: { patient: { id: patient.id } },
    });
    if (already) {
      throw new ConflictException(
        'Ya existe una historia clínica para este paciente',
      );
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
    );
    return saved;
  }
}
