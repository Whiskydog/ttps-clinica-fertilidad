import { BaseEntity } from '@common/entities/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('doctor')
export class Doctor extends BaseEntity {
  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column()
  specialty: string;

  @Column({ name: 'license_number', unique: true })
  licenseNumber: string;
}
