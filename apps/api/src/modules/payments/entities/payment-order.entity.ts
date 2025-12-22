import { BaseEntity } from '@common/entities/base.entity';
import { MedicalInsurance } from '@modules/medical-insurances/entities/medical-insurance.entity';
import { Treatment } from '@modules/treatments/entities/treatment.entity';
import { Patient } from '@modules/users/entities/patient.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';

@Entity()
export class PaymentOrder extends BaseEntity {
  @Column({ name: 'external_id', unique: true })
  @Index()
  externalId: number;

  @OneToOne(() => Treatment, (treatment) => treatment.paymentOrder)
  @JoinColumn({ name: 'treatment_id' })
  treatment: Treatment;

  @ManyToOne(() => MedicalInsurance)
  @JoinColumn({
    name: 'medical_insurance_external_id',
    referencedColumnName: 'externalId',
  })
  medicalInsurance: MedicalInsurance;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id', referencedColumnName: 'id' })
  patient: Patient;

  @Column({ name: 'insurance_due' })
  insuranceDue: number;

  @Column({ name: 'patient_due' })
  patientDue: number;
}
