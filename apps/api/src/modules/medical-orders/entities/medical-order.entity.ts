import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Treatment } from '../../treatments/entities/treatment.entity';

export type MedicalOrderStatus = 'pending' | 'completed';

interface Study {
  name: string;
  checked: boolean;
}

@Entity('medical_orders')
export class MedicalOrder extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ name: 'issue_date', type: 'date' })
  issueDate: Date;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: MedicalOrderStatus;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  studies: Study[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  diagnosis: string;

  @Column({ type: 'text', nullable: true })
  justification: string;

  @Column({ name: 'completed_date', type: 'date', nullable: true })
  completedDate: Date;

  @Column({ type: 'text', nullable: true })
  results: string;

  @Column({ name: 'patient_id' })
  patientId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @Column({ name: 'doctor_id' })
  doctorId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;

  @Column({ name: 'treatment_id', nullable: true })
  treatmentId: number;

  @ManyToOne(() => Treatment, { nullable: true })
  @JoinColumn({ name: 'treatment_id' })
  treatment: Treatment;
}
