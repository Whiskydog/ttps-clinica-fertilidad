import { BaseEntity } from '@common/entities/base.entity';
import { Treatment } from '@modules/treatments/entities/treatment.entity';
import { Patient } from '@modules/users/entities/patient.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  Unique,
} from 'typeorm';
import { Background } from './background.entity';
import { Fenotype } from './fenotype.entity';
import { GynecologicalHistory } from './gynecological-history.entity';
import { Habits } from './habits.entity';
import { PartnerData } from './partner-data.entity';

@Entity('medical_histories')
@Unique(['patient'])
export class MedicalHistory extends BaseEntity {
  @OneToOne(() => Patient, { eager: true, nullable: false })
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

  @OneToOne(() => Treatment, (treatment) => treatment.medicalHistory, {
    nullable: true,
  })
  @JoinColumn({ name: 'current_treatment_id', referencedColumnName: 'id' })
  currentTreatment: Treatment;

  @OneToMany(() => Habits, (habits) => habits.medicalHistory)
  habits: Habits[];

  @OneToMany(() => Fenotype, (fenotype) => fenotype.medicalHistory)
  fenotypes: Fenotype[];

  @OneToMany(() => Background, (background) => background.medicalHistory)
  backgrounds: Background[];

  @OneToMany(() => PartnerData, (partnerData) => partnerData.medicalHistory)
  partnerData: PartnerData[];

  @OneToMany(
    () => GynecologicalHistory,
    (gynecologicalHistory) => gynecologicalHistory.medicalHistory,
  )
  gynecologicalHistory: GynecologicalHistory[];
}
