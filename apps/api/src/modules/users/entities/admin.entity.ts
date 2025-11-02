import { ChildEntity } from 'typeorm';
import { RoleCode } from '@repo/contracts';
import { User } from './user.entity';

@ChildEntity(RoleCode.ADMIN)
export class Admin extends User {
  // Admin no tiene campos adicionales. Es lo mismo que user, pero lo necesitamos para que TypeORM pueda diferenciar entre los tipos de usuarios.
}
