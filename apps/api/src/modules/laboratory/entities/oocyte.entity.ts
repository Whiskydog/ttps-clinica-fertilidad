import { BaseEntity } from '@common/entities/base.entity';
import { OocyteState } from '@repo/contracts';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { PunctureRecord } from './puncture-record.entity';
import { OocyteStateHistory } from './oocyte-state-history.entity';
@Entity('oocytes')
export class Oocyte extends BaseEntity {
  @Column({
    name: 'unique_identifier',
    type: 'varchar',
    length: 50,
    unique: true,
  })
  uniqueIdentifier: string; // ovo_AAAAMMDD_APENOM_NN_XXXXXXX

  @ManyToOne(() => PunctureRecord, { nullable: false })
  @JoinColumn({ name: 'puncture_id', referencedColumnName: 'id' })
  puncture: PunctureRecord;

  @Column({
    name: 'current_state',
    type: 'enum',
    enum: OocyteState,
    enumName: 'oocyte_state_enum',
  })
  currentState: OocyteState;

  @Column({ name: 'is_cryopreserved', type: 'boolean', default: false })
  isCryopreserved: boolean;

  @Column({ name: 'cryo_tank', type: 'varchar', length: 50, nullable: true })
  cryoTank?: string | null;

  @Column({ name: 'cryo_rack', type: 'varchar', length: 50, nullable: true })
  cryoRack?: string | null;

  @Column({ name: 'cryo_tube', type: 'varchar', length: 50, nullable: true })
  cryoTube?: string | null;

  @Column({ name: 'discard_cause', type: 'text', nullable: true })
  discardCause?: string | null;

  @Column({ name: 'discard_date_time', type: 'timestamp', nullable: true })
  discardDateTime?: Date | null;

  @OneToMany(() => OocyteStateHistory, (h) => h.oocyte, {
    eager: false,
    cascade: true,
  })
  stateHistory: OocyteStateHistory[];
}