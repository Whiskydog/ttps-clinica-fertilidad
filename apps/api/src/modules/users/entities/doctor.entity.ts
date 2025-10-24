import { ChildEntity, Column } from "typeorm";
import { RoleCode } from "@repo/contracts";
import { User } from "./user.entity";

@ChildEntity(RoleCode.DOCTOR)
export class Doctor extends User {
  @Column()
  specialty: string;

  @Column({ name: "license_number", unique: true })
  licenseNumber: string;
}