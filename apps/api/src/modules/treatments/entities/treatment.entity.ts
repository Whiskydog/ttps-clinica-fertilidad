import { BaseEntity } from '@common/entities/base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { MedicalHistory } from '../../medical-history/entities/medical-history.entity';

export enum InitialObjective {
  gametos_propios = 'gametos_propios',
  couple_female = 'couple_female',
  method_ropa = 'method_ropa',
  woman_single = 'woman_single',
  preservation_ovocytes_embryos = 'preservation_ovocytes_embryos',
}

export enum TreatmentStatus {
  vigente = 'vigente',
  closed = 'closed',
  completed = 'completed',
}

@Entity('treatments')
export class Treatment extends BaseEntity {
  @ManyToOne(
    () => MedicalHistory,
    (medicalHistory) => medicalHistory.treatments,
  )
  @JoinColumn({ name: 'medical_history_id' })
  medicalHistory: MedicalHistory;

  @Column({
    type: 'enum',
    enum: InitialObjective,
    enumName: 'initial_objective',
    name: 'initial_objective',
  })
  initialObjective: InitialObjective;

  @Column({ type: 'date', nullable: true, name: 'start_date' })
  startDate: Date;

  @Column({ type: 'uuid', nullable: true, name: 'initial_doctor_id' })
  initialDoctorId: string;

  @Column({
    type: 'enum',
    enum: TreatmentStatus,
    enumName: 'treatment_status',
    default: TreatmentStatus.vigente,
    name: 'status',
  })
  status: TreatmentStatus;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'closure_reason',
  })
  closureReason: string;

  @Column({ type: 'date', nullable: true, name: 'closure_date' })
  closureDate: Date;
}
