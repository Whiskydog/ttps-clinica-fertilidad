import { BaseEntity } from '@common/entities/base.entity';
import { RoleCode } from '@repo/contracts';
import { Column, Entity } from 'typeorm';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({
    type: 'enum',
    enum: RoleCode,
    enumName: 'role_code_enum',
    unique: true,
  })
  code: RoleCode;

  @Column()
  name: string;

  @Column()
  description: string;
}
