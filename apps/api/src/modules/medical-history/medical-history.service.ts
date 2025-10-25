import { Injectable, ConflictException } from '@nestjs/common';
import { Not } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalHistory } from './entities/medical-history.entity';
import { PatientDetails } from '../users/entities/patient-details.entity';
import { User } from '../users/entities/user.entity';
import { Patient } from '../users/entities/patient.entity';
import { AuditService } from '../audit/audit.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MedicalHistoryService {
  constructor(
    @InjectRepository(MedicalHistory)
    private readonly medicalHistoryRepo: Repository<MedicalHistory>,
    @InjectRepository(PatientDetails)
    private readonly patientDetailsRepo: Repository<PatientDetails>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Patient)
    private readonly patientUserRepo: Repository<Patient>,
    private readonly auditService: AuditService,
    private readonly config: ConfigService,
  ) {}

  async findByPatientId(patientId: number) {
    return this.medicalHistoryRepo.findOne({
      where: { patient_id: patientId },
    });
  }

  async findById(id: number) {
    return this.medicalHistoryRepo.findOne({ where: { id } });
  }

  async createForPatient(patientId: number) {
    // Modo tolerante: si aún no existe el esquema de usuarios/pacientes o no hay paciente con ese id,
    // podemos crear un paciente "placeholder" y luego la HC.
    const allowFallback =
      this.config.get<string>('ALLOW_HC_CREATE_WITHOUT_PATIENT') === 'true';
    let patient: PatientDetails | null = null;
    let user: User | null = null;
    try {
      patient = await this.patientDetailsRepo.findOne({
        where: { id: patientId },
      });
      if (patient) {
        user = await this.userRepo.findOne({
          where: { id: String((patient as any).user_id) },
        });
      }
    } catch {
      // Si faltan tablas (p.ej., relation "public.patient_details" does not exist), seguimos sin validar duplicados
      patient = null;
      user = null;
    }

    if (!patient && !allowFallback) {
      throw new ConflictException('Paciente no encontrado');
    }
    if (patient && user) {
      // Buscar duplicados por DNI, email, nombre+fecha nacimiento
      const dniDup = await this.patientDetailsRepo.findOne({
        where: { dni: patient.dni, id: Not(patient.id) },
      });
      const emailDup = await this.userRepo.findOne({
        where: { email: user.email, id: Not(user.id) as any },
      });
      const nameDobDup = await this.patientDetailsRepo
        .createQueryBuilder('pd')
        .leftJoin(User, 'u', 'pd.user_id = u.id')
        .where(
          'u.first_name = :fn AND u.last_name = :ln AND pd.date_of_birth = :dob AND pd.id != :pid',
          {
            fn: (user as any).firstName,
            ln: (user as any).lastName,
            dob: (patient as any).date_of_birth,
            pid: patient.id,
          },
        )
        .getOne();

      if (dniDup || emailDup || nameDobDup) {
        await this.auditService.log(
          'medical_histories',
          patientId,
          'creation',
          null,
          'duplicated',
          user.id,
          'patient',
        );
        throw new ConflictException(
          'Duplicado detectado por DNI, email o nombre+fecha nacimiento',
        );
      }
    }

    // Si no existe el paciente y está permitido el fallback, generamos un paciente/usuario placeholder.
    if (!patient && allowFallback) {
      const suffix = Math.random().toString(36).slice(2, 8);
      const tempEmail = `temp+${Date.now()}_${suffix}@example.local`;

      // Creamos un usuario subtipo Patient para que el discriminador (role) sea 'patient'
      const tempUser = this.patientUserRepo.create({
        firstName: 'Temp',
        lastName: `Patient-${suffix}`,
        email: tempEmail,
        phone: '',
        passwordHash: `TEMP-${suffix}`,
        isActive: true,
        // No seteamos 'role' manualmente: el @ChildEntity(RoleCode.PATIENT) se encarga del discriminador
      });
      user = await this.patientUserRepo.save(tempUser as Patient);

      const ts8 = String(Date.now()).slice(-8);
      const shortSuf = suffix.slice(0, 4);
      const tempDni = `TMP-${ts8}-${shortSuf}`; // ej: TMP-12345678-ab (<= 20)

      const tempPatient = this.patientDetailsRepo.create({
        user_id: user.id,
        dni: tempDni,
        // fecha por defecto para cumplir NOT NULL
        date_of_birth: new Date('1970-01-01T00:00:00.000Z'),
        occupation: undefined as any,
        biological_sex: undefined as any,
        medical_insurance_id: undefined as any,
        coverage_member_id: undefined as any,
      });
      patient = await this.patientDetailsRepo.save(tempPatient);

      // Auditamos la creación de placeholder
      await this.auditService.log(
        'patient_details',
        patient.id,
        'creation',
        null,
        'placeholder-created',
        null,
        'system',
      );
    }

    // Crear HC apuntando al paciente existente o recién generado
    const effectivePatientId = patient ? patient.id : patientId;
    const hc = this.medicalHistoryRepo.create({
      patient_id: effectivePatientId,
    });
    const saved = await this.medicalHistoryRepo.save(hc);
    await this.auditService.log(
      'medical_histories',
      saved.id,
      'creation',
      null,
      'created',
      user ? user.id : null,
      user ? 'patient' : 'system',
    );
    return saved;
  }
}
