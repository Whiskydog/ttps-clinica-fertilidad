import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalHistory } from '@modules/medical-history/entities/medical-history.entity';
import { MedicalHistoryService } from '@modules/medical-history/medical-history.service';
import { MedicalHistoryController } from '@modules/medical-history/medical-history.controller';
import { PatientDetails } from '@modules/users/entities/patient-details.entity';
import { User } from '@modules/users/entities/user.entity';
import { AuditModule } from '@modules/audit/audit.module';
import { Patient } from '@modules/users/entities/patient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalHistory, PatientDetails, User, Patient]),
    AuditModule,
  ],
  providers: [MedicalHistoryService],
  controllers: [MedicalHistoryController],
  exports: [MedicalHistoryService],
})
export class MedicalHistoryModule {}
