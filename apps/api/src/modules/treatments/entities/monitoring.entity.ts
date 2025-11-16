import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Treatment } from './treatment.entity';

@Entity('treatment_monitorings')
export class Monitoring extends BaseEntity {
  @Column({ name: 'treatment_id' })
  treatmentId: number;

  @ManyToOne(() => Treatment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'treatment_id' })
  treatment: Treatment;

  @Column({ name: 'monitoring_date', type: 'date' })
  monitoringDate: Date;

  @Column({ name: 'day_number', type: 'int', nullable: true })
  dayNumber: number;

  @Column({ name: 'follicle_count', type: 'int', nullable: true })
  follicleCount: number;

  @Column({ name: 'follicle_size', type: 'varchar', length: 50, nullable: true })
  follicleSize: string;

  @Column({
    name: 'estradiol_level',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  estradiolLevel: number;

  @Column({ type: 'text', nullable: true })
  observations: string;
}
