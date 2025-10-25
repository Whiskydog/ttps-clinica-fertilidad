import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
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
export class Treatment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => MedicalHistory,
    (medicalHistory) => medicalHistory.treatments,
  )
  @JoinColumn({ name: 'medical_history_id' })
  medical_history: MedicalHistory;

  @Column({ type: 'varchar', length: 50 })
  @Column({
    type: 'enum',
    enum: InitialObjective,
    enumName: 'initial_objective',
  })
  initial_objective: InitialObjective;

  @Column({ type: 'date', nullable: true })
  start_date: Date;

  @Column({ type: 'bigint', nullable: true })
  initial_doctor_id: number;

  @Column({ type: 'varchar', length: 20 })
  @Column({
    type: 'enum',
    enum: TreatmentStatus,
    enumName: 'treatment_status',
    default: TreatmentStatus.vigente,
  })
  status: TreatmentStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  closure_reason: string;

  @Column({ type: 'date', nullable: true })
  closure_date: Date;
}
