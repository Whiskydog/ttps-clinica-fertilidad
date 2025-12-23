import { Appointment } from '@modules/appointments/appointment.entity';
import { RoleCode } from '@repo/contracts';
import { ChildEntity, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';

@ChildEntity(RoleCode.DOCTOR)
export class Doctor extends User {
  @Column()
  specialty: string;

  @Column({ name: 'license_number', unique: true })
  licenseNumber: string;

  @Column({ name: 'signature_uri', type: 'text', nullable: true })
  signatureUri?: string | null;

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  appointments: Appointment[];
}
