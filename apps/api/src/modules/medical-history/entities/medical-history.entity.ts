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
import { Habits } from './habits.entity';
import { Fenotype } from './fenotype.entity';
import { Background } from './background.entity';

@Entity('medical_histories')
@Unique(['patient'])
export class MedicalHistory extends BaseEntity {
  @ManyToOne(() => Patient, { eager: true, nullable: false })
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

  @OneToMany(() => Habits, (habits) => habits.medicalHistory)
  habits: Habits[];

  @OneToMany(() => Fenotype, (fenotype) => fenotype.medicalHistory)
  fenotypes: Fenotype[];

  @OneToMany(() => Background, (background) => background.medicalHistory)
  backgrounds: Background[];
}
