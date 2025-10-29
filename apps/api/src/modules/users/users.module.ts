import { MedicalInsurancesModule } from '@modules/medical-insurances/medical-insurances.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorsController } from './controllers/doctors.controller';
import { PatientsController } from './controllers/patients.controller';
import { UsersController } from './controllers/users.controller';
import { Doctor } from './entities/doctor.entity';
import { Patient } from './entities/patient.entity';
import { User } from './entities/user.entity';
import { DoctorsService } from './services/doctors.service';
import { PatientsService } from './services/patients.service';
import { UserValidationService } from './services/user-validation.service';
import { UsersService } from './services/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Patient, Doctor]),
    MedicalInsurancesModule,
  ],
  controllers: [UsersController, PatientsController, DoctorsController],
  providers: [
    UsersService,
    PatientsService,
    DoctorsService,
    UserValidationService,
  ],
  exports: [UsersService, PatientsService],
})
export class UsersModule {}
