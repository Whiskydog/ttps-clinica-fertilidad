import { BaseEntity } from '@common/entities/base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { MedicalHistory } from './medical-history.entity';

@Entity('habits')
export class Habits extends BaseEntity {
  @ManyToOne(() => MedicalHistory, { nullable: false })
  @JoinColumn({ name: 'medical_history_id', referencedColumnName: 'id' })
  medicalHistory: MedicalHistory;

  @Column({ name: 'cigarettes_per_day', type: 'smallint', nullable: true })
  cigarettesPerDay?: number | null;

  @Column({ name: 'years_smoking', type: 'smallint', nullable: true })
  yearsSmoking?: number | null;

  @Column({
    name: 'pack_days_value',
    type: 'decimal',
    precision: 6,
    scale: 2,
    nullable: true,
  })
  packDaysValue?: number | null;

  @Column({ name: 'alcohol_consumption', type: 'text', nullable: true })
  alcoholConsumption?: string | null;

  @Column({
    name: 'recreational_drugs',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  recreationalDrugs?: string | null;
}
