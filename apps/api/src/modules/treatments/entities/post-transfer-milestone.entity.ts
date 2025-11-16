import { BaseEntity } from '@common/entities/base.entity';
import { MilestoneType } from '@repo/contracts';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Treatment } from './treatment.entity';
import { Doctor } from '@users/entities/doctor.entity';

@Entity('post_transfer_milestones')
export class PostTransferMilestone extends BaseEntity {
  @ManyToOne(() => Treatment, { nullable: false })
  @JoinColumn({ name: 'treatment_id', referencedColumnName: 'id' })
  treatment: Treatment;

  @Column({
    name: 'milestone_type',
    type: 'enum',
    enum: MilestoneType,
    enumName: 'milestone_type_enum',
  })
  milestoneType: MilestoneType;

  @Column({ name: 'result', type: 'varchar', length: 20, nullable: true })
  result?: string | null;

  @Column({ name: 'milestone_date', type: 'date', nullable: true })
  milestoneDate?: Date | null;

  @ManyToOne(() => Doctor, { nullable: true })
  @JoinColumn({ name: 'registered_by_doctor_id', referencedColumnName: 'id' })
  registeredByDoctor?: Doctor | null;
}
