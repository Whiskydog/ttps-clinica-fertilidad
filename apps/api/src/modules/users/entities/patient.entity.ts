import { ChildEntity, Column } from "typeorm";
import { User } from "./user.entity";
import { BiologicalSex, RoleCode } from "@repo/contracts";

@ChildEntity(RoleCode.PATIENT)
export class Patient extends User {
  @Column()
  dni: string;

  @Column()
  dateOfBirth: Date;

  @Column()
  occupation: string;

  @Column({
    type: "enum",
    enum: BiologicalSex,
    enumName: "biological_sex_enum",
  })
  biologicalSex: BiologicalSex;
}