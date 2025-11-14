import { BaseEntity } from '@common/entities/base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { MedicalHistory } from './medical-history.entity';
import { PartnerData } from './partner-data.entity';
import { CycleRegularity } from '@repo/contracts';

@Entity('gynecological_history')
export class GynecologicalHistory extends BaseEntity {
  @ManyToOne(() => MedicalHistory, { nullable: false })
  @JoinColumn({ name: 'medical_history_id', referencedColumnName: 'id' })
  medicalHistory: MedicalHistory;

  // If null -> applies to patient; if set -> applies to partner (ROPA)
  @ManyToOne(() => PartnerData, { nullable: true, eager: true })
  @JoinColumn({ name: 'partner_data_id', referencedColumnName: 'id' })
  partnerData?: PartnerData | null;

  @Column({ name: 'menarche_age', type: 'smallint', nullable: true })
  menarcheAge?: number | null;

  @Column({
    name: 'cycle_regularity',
    type: 'enum',
    enum: CycleRegularity,
    enumName: 'cycle_regularity_enum',
    nullable: true,
  })
  cycleRegularity?: CycleRegularity | null;

  @Column({ name: 'cycle_duration_days', type: 'smallint', nullable: true })
  cycleDurationDays?: number | null;

  @Column({ name: 'bleeding_characteristics', type: 'text', nullable: true })
  bleedingCharacteristics?: string | null;

  @Column({ name: 'gestations', type: 'smallint', nullable: true })
  gestations?: number | null;

  @Column({ name: 'births', type: 'smallint', nullable: true })
  births?: number | null;

  @Column({ name: 'abortions', type: 'smallint', nullable: true })
  abortions?: number | null;

  @Column({ name: 'ectopic_pregnancies', type: 'smallint', nullable: true })
  ectopicPregnancies?: number | null;
}
