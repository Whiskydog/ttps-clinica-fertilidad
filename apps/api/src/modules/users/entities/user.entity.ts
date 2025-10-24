import { BaseEntity } from "@common/entities/base.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, TableInheritance } from "typeorm";
import { RoleCode } from "@repo/contracts";
import { Role } from "./role.entity";

@Entity("users")
@TableInheritance({ column: { type: "enum", enum: RoleCode, enumName: 'role_code_enum', name: "role" } })
export class User extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  passwordHash: string;

  @Column()
  isActive: boolean;

  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({ name: "role", referencedColumnName: "code" })
  role: Role;
}