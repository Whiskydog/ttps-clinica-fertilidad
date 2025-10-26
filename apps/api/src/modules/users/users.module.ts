import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { PatientsController } from './controllers/patients.controller';
import { PatientsService } from './services/patients.service';
import { Doctor } from './entities/doctor.entity';
import { DoctorsController } from './controllers/doctors.controller';
import { DoctorsService } from './services/doctors.service';
import { UsersService } from './services/users.service';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Patient, Doctor, Role])],
  controllers: [PatientsController, DoctorsController],
  providers: [UsersService, PatientsService, DoctorsService],
  exports: [UsersService, PatientsService],
})
export class UsersModule {}
