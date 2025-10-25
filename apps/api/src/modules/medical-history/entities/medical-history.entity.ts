import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { Treatment } from '@modules/treatments/entities/treatment.entity';

@Entity('medical_histories')
@Unique(['patient_id'])
export class MedicalHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  patient_id: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  creation_date: Date;

  @Column({ type: 'text', nullable: true })
  physical_exam_notes: string;

  @Column({ type: 'text', nullable: true })
  family_backgrounds: string;

  @OneToMany(
    () => Treatment,
    (treatment: Treatment) => treatment.medical_history,
  )
  treatments: Treatment[];
}
