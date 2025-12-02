import { MedicalHistory } from '@modules/medical-history/entities/medical-history.entity';
import { MedicalInsurance } from '@modules/medical-insurances/entities/medical-insurance.entity';
import { BiologicalSex, RoleCode } from '@repo/contracts';
import { ChildEntity, Column, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { User } from './user.entity';

@ChildEntity(RoleCode.PATIENT)
export class Patient extends User {
  @Column({ unique: true })
  dni: string;

  @Column({ name: 'date_of_birth' })
  dateOfBirth: Date;

  @Column({ nullable: true })
  occupation: string | null;

  @Column({ nullable: true })
  address: string | null;

  @Column({
    type: 'enum',
    enum: BiologicalSex,
    enumName: 'biological_sex_enum',
    name: 'biological_sex',
  })
  biologicalSex: BiologicalSex;

  @ManyToOne(() => MedicalInsurance, { nullable: true, eager: true })
  @JoinColumn({ name: 'medical_insurance_id' })
  medicalInsurance: MedicalInsurance | null;

  @Column({
    name: 'coverage_member_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  coverageMemberId: string | null;

  @OneToOne(() => MedicalHistory, (medicalHistory) => medicalHistory.patient, {
    nullable: true,
  })
  medicalHistory: MedicalHistory | null;
}
