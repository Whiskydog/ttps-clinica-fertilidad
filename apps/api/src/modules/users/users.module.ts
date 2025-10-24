import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Patient } from "./entities/patient.entity";
import { PatientsController } from "./controllers/patients.controller";
import { PatientsService } from "./services/patients.service";
import { Doctor } from "./entities/doctor.entity";
import { DoctorsController } from "./controllers/doctors.controller";
import { DoctorsService } from "./services/doctors.service";

@Module({
  imports: [TypeOrmModule.forFeature([Patient, Doctor])],
  controllers: [PatientsController, DoctorsController],
  providers: [PatientsService, DoctorsService],
})
export class UsersModule { }