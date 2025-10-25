import { ChildEntity, Column } from 'typeorm';
import { User } from './user.entity';
import { BiologicalSex, RoleCode } from '@repo/contracts';

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
}
