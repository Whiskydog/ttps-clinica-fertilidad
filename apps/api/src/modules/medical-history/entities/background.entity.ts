import { BaseEntity } from '@common/entities/base.entity';
import { BackgroundType } from '@repo/contracts';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { MedicalHistory } from './medical-history.entity';

@Entity('backgrounds')
export class Background extends BaseEntity {
  @ManyToOne(() => MedicalHistory, { nullable: false })
  @JoinColumn({ name: 'medical_history_id', referencedColumnName: 'id' })
  medicalHistory: MedicalHistory;

  @Column({ name: 'term_code', type: 'varchar', length: 50, nullable: true })
  termCode?: string | null;

  @Column({
    name: 'background_type',
    type: 'enum',
    enum: BackgroundType,
    enumName: 'background_type_enum',
  })
  backgroundType: BackgroundType;
}
