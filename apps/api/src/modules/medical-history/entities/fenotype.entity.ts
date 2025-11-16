import { BaseEntity } from '@common/entities/base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { MedicalHistory } from './medical-history.entity';
import { PartnerData } from './partner-data.entity';

@Entity('fenotypes')
export class Fenotype extends BaseEntity {
  @ManyToOne(() => MedicalHistory, (medicalHistory) => medicalHistory.fenotypes, { nullable: false })
  @JoinColumn({ name: 'medical_history_id', referencedColumnName: 'id' })
  medicalHistory: MedicalHistory;

  // If null -> applies to patient; if set -> applies to partner (ROPA)
  @ManyToOne(() => PartnerData, (partnerData) => partnerData.fenotypes, { nullable: true, eager: true })
  @JoinColumn({ name: 'partner_data_id', referencedColumnName: 'id' })
  partnerData?: PartnerData | null;

  @Column({ name: 'eye_color', type: 'varchar', length: 50, nullable: true })
  eyeColor?: string | null;

  @Column({ name: 'hair_color', type: 'varchar', length: 50, nullable: true })
  hairColor?: string | null;

  @Column({ name: 'hair_type', type: 'varchar', length: 50, nullable: true })
  hairType?: string | null;

  @Column({
    name: 'height',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  height?: number | null;

  @Column({ name: 'complexion', type: 'varchar', length: 20, nullable: true })
  complexion?: string | null;

  @Column({ name: 'ethnicity', type: 'varchar', length: 100, nullable: true })
  ethnicity?: string | null;
}
