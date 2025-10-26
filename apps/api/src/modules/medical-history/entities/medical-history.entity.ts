import { BaseEntity } from '@common/entities/base.entity';
import {
  Entity,
  Column,
  OneToMany,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Treatment } from '@modules/treatments/entities/treatment.entity';
import { Patient } from '../../users/entities/patient.entity';

@Entity('medical_histories')
@Unique(['patient'])
export class MedicalHistory extends BaseEntity {
  @ManyToOne(() => Patient, { eager: true })
  @JoinColumn({ name: 'patient_id', referencedColumnName: 'id' })
  patient: Patient;

  @Column({
    default: () => 'CURRENT_TIMESTAMP',
    name: 'creation_date',
  })
  creationDate: Date;

  @Column({ type: 'text', nullable: true, name: 'physical_exam_notes' })
  physicalExamNotes: string;

  @Column({ type: 'text', nullable: true, name: 'family_backgrounds' })
  familyBackgrounds: string;

  @OneToMany(
    () => Treatment,
    (treatment: Treatment) => treatment.medicalHistory,
  )
  treatments: Treatment[];
}
