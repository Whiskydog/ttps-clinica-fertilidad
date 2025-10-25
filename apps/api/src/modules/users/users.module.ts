import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Patient } from "./entities/patient.entity";
import { PatientsController } from "./controllers/patients.controller";
import { PatientsService } from "./services/patients.service";
import { Doctor } from "./entities/doctor.entity";
import { DoctorsController } from "./controllers/doctors.controller";
import { DoctorsService } from "./services/doctors.service";
import { User } from "./entities/user.entity";
import { Role } from "./entities/role.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Patient, Doctor, User, Role])],
  controllers: [PatientsController, DoctorsController],
  providers: [PatientsService, DoctorsService],
  exports: [PatientsService],
})
export class UsersModule { }