import { BaseEntity } from '@common/entities/base.entity';
import {
  FertilizationTechnique,
  SemenSource,
  PgtResult,
  EmbryoDisposition,
} from '@repo/contracts';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Oocyte } from './oocyte.entity';
import { LabTechnician } from '@users/entities/lab-technician.entity';

@Entity('embryos')
export class Embryo extends BaseEntity {
  @Column({
    name: 'unique_identifier',
    type: 'varchar',
    length: 50,
    unique: true,
  })
  uniqueIdentifier: string; // emb_AAAAMMDD...

  @ManyToOne(() => Oocyte, { nullable: false })
  @JoinColumn({ name: 'oocyte_origin_id', referencedColumnName: 'id' })
  oocyteOrigin: Oocyte;

  @Column({ name: 'fertilization_date', type: 'date', nullable: true })
  fertilizationDate?: Date | null;

  @Column({
    name: 'fertilization_technique',
    type: 'enum',
    enum: FertilizationTechnique,
    enumName: 'fertilization_technique_enum',
    nullable: true,
  })
  fertilizationTechnique?: FertilizationTechnique | null;

  @ManyToOne(() => LabTechnician, { nullable: true })
  @JoinColumn({ name: 'technician_id', referencedColumnName: 'id' })
  technician?: LabTechnician | null;

  @Column({ name: 'quality_score', type: 'smallint', nullable: true })
  qualityScore?: number | null; // 1-6

  @Column({
    name: 'semen_source',
    type: 'enum',
    enum: SemenSource,
    enumName: 'semen_source_enum',
    nullable: true,
  })
  semenSource?: SemenSource | null;

  @Column({
    name: 'donation_id_used',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  donationIdUsed?: string | null;

  @Column({
    name: 'pgt_decision_suggested',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  pgtDecisionSuggested?: string | null;

  @Column({
    name: 'pgt_result',
    type: 'enum',
    enum: PgtResult,
    enumName: 'pgt_result_enum',
    nullable: true,
  })
  pgtResult?: PgtResult | null;

  @Column({
    name: 'final_disposition',
    type: 'enum',
    enum: EmbryoDisposition,
    enumName: 'embryo_disposition_enum',
    nullable: true,
  })
  finalDisposition?: EmbryoDisposition | null;

  @Column({ name: 'cryo_tank', type: 'varchar', length: 50, nullable: true })
  cryoTank?: string | null;

  @Column({ name: 'cryo_rack', type: 'varchar', length: 50, nullable: true })
  cryoRack?: string | null;

  @Column({ name: 'cryo_tube', type: 'varchar', length: 50, nullable: true })
  cryoTube?: string | null;

  @Column({ name: 'discard_cause', type: 'text', nullable: true })
  discardCause?: string | null;
}
