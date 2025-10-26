import { BiologicalSex, RoleCode } from '@repo/contracts';
import { ChildEntity, Column } from 'typeorm';
import { User } from './user.entity';
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

  @Column({ name: 'medical_insurance_id', type: 'bigint', nullable: true })
  medicalInsuranceId: number | null;

  @Column({
    name: 'coverage_member_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  coverageMemberId: string | null;
}
