import { ChildEntity, Column } from 'typeorm';
import { RoleCode } from '@repo/contracts';
import { User } from './user.entity';

@ChildEntity(RoleCode.DIRECTOR)
export class Director extends User {
  @Column({ name: 'license_number', unique: true })
  licenseNumber: string;

  @Column({ name: 'signature_uri', type: 'text', nullable: true })
  signatureUri?: string | null;
}
