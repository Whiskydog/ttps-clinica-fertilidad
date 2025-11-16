import { BaseEntity } from '@common/entities/base.entity';
import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Treatment } from './treatment.entity';
import { MedicalInsurance } from '@modules/medical-insurances/entities/medical-insurance.entity';

@Entity('medical_coverage')
export class MedicalCoverage extends BaseEntity {
  @ManyToOne(() => MedicalInsurance, { nullable: false })
  @JoinColumn({ name: 'medical_insurance_id', referencedColumnName: 'id' })
  medicalInsurance: MedicalInsurance;

  @OneToOne(() => Treatment, (treatment) => treatment.medicalCoverage, { nullable: false })
  @JoinColumn({ name: 'treatment_id', referencedColumnName: 'id' })
  treatment: Treatment;

  @Column({
    name: 'coverage_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  coveragePercentage?: number | null;

  @Column({
    name: 'patient_due',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  patientDue?: number | null;

  @Column({
    name: 'insurance_due',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  insuranceDue?: number | null;
}
