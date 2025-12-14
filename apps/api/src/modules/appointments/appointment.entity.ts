import { BaseEntity } from '@common/entities/base.entity';
import { MedicalHistory } from '@modules/medical-history/entities/medical-history.entity';
import { Treatment } from '@modules/treatments/entities/treatment.entity';
import { Doctor } from '@modules/users/entities/doctor.entity';
import { ReasonForVisit } from '@repo/contracts';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Entity('appointments')
export class Appointment extends BaseEntity {
  @ManyToOne(
    () => MedicalHistory,
    (medicalHistory) => medicalHistory.appointments,
    {
      nullable: false,
    },
  )
  @JoinColumn({ name: 'medical_history_id', referencedColumnName: 'id' })
  medicalHistory: MedicalHistory;

  @ManyToOne(() => Treatment, (treatment) => treatment.appointments)
  @JoinColumn({ name: 'treatment_id', referencedColumnName: 'id' })
  treatment: Treatment;

  @ManyToOne(() => Doctor, { nullable: false })
  @JoinColumn({ name: 'doctor_id', referencedColumnName: 'id' })
  doctor: Doctor;

  @Index()
  @Column({ unique: true })
  externalId: number;

  @Column({
    type: 'enum',
    enum: ReasonForVisit,
    enumName: 'reason_for_visit',
    default: ReasonForVisit.InitialConsultation,
  })
  reason: ReasonForVisit;

  @Column()
  date: Date;
}
