import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Treatment } from './treatment.entity';

@Entity('doctor_notes')
export class DoctorNote extends BaseEntity {
  @Column({ name: 'treatment_id' })
  treatmentId: number;

  @ManyToOne(() => Treatment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'treatment_id' })
  treatment: Treatment;

  @Column({ name: 'doctor_id' })
  doctorId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;

  @Column({ name: 'note_date', type: 'date' })
  noteDate: Date;

  @Column({ type: 'text' })
  note: string;
}
