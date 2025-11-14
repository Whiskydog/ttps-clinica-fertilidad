import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Treatment } from '@modules/treatments/entities/treatment.entity';
import { Monitoring } from '@modules/treatments/entities/monitoring.entity';
import { MedicationProtocol } from '@modules/treatments/entities/medication-protocol.entity';
import { DoctorNote } from '@modules/treatments/entities/doctor-note.entity';
import { MedicalHistory } from '../medical-history/entities/medical-history.entity';
import { TreatmentService } from '@modules/treatments/treatment.service';
import { TreatmentsService } from '@modules/treatments/treatments.service';
import { TreatmentsController } from '@modules/treatments/treatments.controller';
import { MedicalHistoryModule } from '../medical-history/medical-history.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Treatment,
      Monitoring,
      MedicationProtocol,
      DoctorNote,
      MedicalHistory,
    ]),
    MedicalHistoryModule,
  ],
  providers: [TreatmentService, TreatmentsService],
  controllers: [TreatmentsController],
  exports: [TreatmentService, TreatmentsService],
})
export class TreatmentsModule {}
