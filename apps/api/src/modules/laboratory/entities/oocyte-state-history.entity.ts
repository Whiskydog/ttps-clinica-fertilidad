import { BaseEntity } from '@common/entities/base.entity';
import { OocyteState } from '@repo/contracts';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Oocyte } from './oocyte.entity';

@Entity('oocyte_state_history')
export class OocyteStateHistory extends BaseEntity {
  @ManyToOne(() => Oocyte, { nullable: false })
  @JoinColumn({ name: 'oocyte_id', referencedColumnName: 'id' })
  oocyte: Oocyte;

  @Column({
    name: 'previous_state',
    type: 'enum',
    enum: OocyteState,
    enumName: 'oocyte_state_enum',
    nullable: true,
  })
  previousState?: OocyteState | null;

  @Column({
    name: 'new_state',
    type: 'enum',
    enum: OocyteState,
    enumName: 'oocyte_state_enum',
  })
  newState: OocyteState;

  @Column({ name: 'transition_date', type: 'timestamp' })
  transitionDate: Date;

  @Column({ name: 'cause', type: 'text', nullable: true })
  cause?: string | null;
}
