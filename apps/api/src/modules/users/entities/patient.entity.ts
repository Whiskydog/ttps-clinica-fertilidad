import { BaseEntity } from '@common/entities/base.entity';
import { BiologicalSex } from '@repo/contracts';
import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('patient')
@Index(
  'UQ_patient_medins_coverage',
  ['medicalInsuranceId', 'coverageMemberId'],
  {
    unique: true,
  },
)
export class Patient extends BaseEntity {
  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column({ unique: true })
  dni: string;

  @Column({ name: 'date_of_birth', type: 'date' })
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
