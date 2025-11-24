import { ChildEntity, Column } from 'typeorm';
import { RoleCode } from '@repo/contracts';
import { User } from './user.entity';

@ChildEntity(RoleCode.LAB_TECHNICIAN)
export class LabTechnician extends User {
  @Column({ name: 'lab_area' })
  labArea: string;
}
