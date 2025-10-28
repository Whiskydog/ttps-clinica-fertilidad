import { BiologicalSex, RoleCode } from '@repo/contracts';
import { ChildEntity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { MedicalInsurance } from '@modules/medical-insurances/entities/medical-insurance.entity';
@ChildEntity(RoleCode.PATIENT)
export class Patient extends User {
  @Column({ unique: true })
  dni: string;

  @Column({ name: 'date_of_birth' })
  dateOfBirth: Date;

  @Column()
  occupation: string;

  @Column({
    type: 'enum',
    enum: BiologicalSex,
    enumName: 'biological_sex_enum',
    name: 'biological_sex',
  })
  biologicalSex: BiologicalSex;

  @ManyToOne(() => MedicalInsurance, { nullable: true })
  @JoinColumn({ name: 'medical_insurance_id' })
  medicalInsurance?: MedicalInsurance | null;

  @Column({
    name: 'coverage_member_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  coverageMemberId: string | null;
}
