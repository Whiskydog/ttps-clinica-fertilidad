import { MedicalInsurancesModule } from '@modules/medical-insurances/medical-insurances.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorsController } from './controllers/doctors.controller';
import { PatientsController } from './controllers/patients.controller';
import { StaffUsersController } from './controllers/staff-users.controller';
import { UsersController } from './controllers/users.controller';
import { Admin } from './entities/admin.entity';
import { Director } from './entities/director.entity';
import { Doctor } from './entities/doctor.entity';
import { LabTechnician } from './entities/lab-technician.entity';
import { Patient } from './entities/patient.entity';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { Treatment } from '@modules/treatments/entities/treatment.entity';
import { DoctorsService } from './services/doctors.service';
import { PatientsService } from './services/patients.service';
import { StaffUsersService } from './services/staff-users.service';
import { UserValidationService } from './services/user-validation.service';
import { UsersService } from './services/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Patient,
      Doctor,
      Director,
      LabTechnician,
      Admin,
      Role,
      Treatment,
    ]),
    MedicalInsurancesModule,
  ],
  controllers: [
    UsersController,
    PatientsController,
    DoctorsController,
    StaffUsersController,
  ],
  providers: [
    UsersService,
    PatientsService,
    DoctorsService,
    UserValidationService,
    StaffUsersService,
  ],
  exports: [UsersService, PatientsService],
})
export class UsersModule {}
