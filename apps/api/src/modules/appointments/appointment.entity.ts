import { BaseEntity } from '@common/entities/base.entity';
import { Treatment } from '@modules/treatments/entities/treatment.entity';
import { Doctor } from '@modules/users/entities/doctor.entity';
import { ReasonForVisit } from '@repo/contracts';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Entity('appointments')
export class Appointment extends BaseEntity {
  @ManyToOne(() => Treatment, (treatment) => treatment.appointments)
  @JoinColumn({ name: 'treatment_id', referencedColumnName: 'id' })
  treatment: Treatment;

  @ManyToOne(() => Doctor, { nullable: false })
  @JoinColumn({ name: 'doctor_id', referencedColumnName: 'id' })
  doctor: Doctor;

  @Index()
  @Column()
  externalId: string;
  @Column({ name: 'is_overtime', type: 'boolean', default: false })
  isOvertime: boolean;
  @Column({
    type: 'enum',
    enum: ReasonForVisit,
    enumName: 'reason_for_visit',
    default: ReasonForVisit.InitialConsultation,
  })
  reason: ReasonForVisit;
}
