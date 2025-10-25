import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('patient_details')
@Unique(['dni'])
export class PatientDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', length: 20 })
  dni: string;

  @Column({ type: 'date' })
  date_of_birth: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  occupation: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  biological_sex: string;

  @Column({ type: 'bigint' })
  medical_insurance_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  coverage_member_id: string;
}
