import { BaseEntity } from '@common/entities/base.entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { MedicalHistory } from '../../medical-history/entities/medical-history.entity';
import { InitialObjective, TreatmentStatus } from '@repo/contracts';
import { User } from '@users/entities/user.entity';
import { PostTransferMilestone } from './post-transfer-milestone.entity';
import { InformedConsent } from './informed-consent.entity';
import { MedicalCoverage } from './medical-coverage.entity';

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
  startDate: Date | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'initial_doctor_id', referencedColumnName: 'id' })
  initialDoctor?: User | null;

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
  closureDate: Date | null;

  @OneToOne(() => InformedConsent, (consent) => consent.treatment)
  informedConsent?: InformedConsent;

  @OneToMany(() => PostTransferMilestone, (milestone) => milestone.treatment)
  milestones: PostTransferMilestone[];

  @OneToOne(() => MedicalCoverage, (coverage) => coverage.treatment)
  medicalCoverage?: MedicalCoverage;
}
