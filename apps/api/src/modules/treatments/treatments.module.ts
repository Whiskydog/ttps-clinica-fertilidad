import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Treatment } from '@modules/treatments/entities/treatment.entity';
import { Monitoring } from '@modules/treatments/entities/monitoring.entity';
import { MedicationProtocol } from '@modules/treatments/entities/medication-protocol.entity';
import { DoctorNote } from '@modules/treatments/entities/doctor-note.entity';
import { InformedConsent } from '@modules/treatments/entities/informed-consent.entity';
import { PostTransferMilestone } from '@modules/treatments/entities/post-transfer-milestone.entity';
import { MedicalCoverage } from '@modules/treatments/entities/medical-coverage.entity';
import { MedicalHistory } from '../medical-history/entities/medical-history.entity';
import { MedicalOrder } from '../medical-orders/entities/medical-order.entity';
import { PunctureRecord } from '../laboratory/entities/puncture-record.entity';
import { TreatmentService } from '@modules/treatments/treatment.service';
import { TreatmentsService } from '@modules/treatments/treatments.service';
import { InformedConsentService } from '@modules/treatments/services/informed-consent.service';
import { PostTransferMilestoneService } from '@modules/treatments/services/post-transfer-milestone.service';
import { MedicalCoverageService } from '@modules/treatments/services/medical-coverage.service';
import { DoctorNoteService } from '@modules/treatments/services/doctor-note.service';
import { MedicationProtocolService } from '@modules/treatments/services/medication-protocol.service';
import { MedicationPdfService } from '@modules/treatments/services/medication-pdf.service';
import { TreatmentsController } from '@modules/treatments/treatments.controller';
import { MedicalHistoryModule } from '../medical-history/medical-history.module';
import { UploadsModule } from '@modules/uploads/uploads.module';
import { Group8NoticesModule } from '../external/group8-notices/group8-notices.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Treatment,
      Monitoring,
      MedicationProtocol,
      DoctorNote,
      InformedConsent,
      PostTransferMilestone,
      MedicalCoverage,
      MedicalHistory,
      MedicalOrder,
      PunctureRecord,
    ]),
    MedicalHistoryModule,
    UploadsModule,
    Group8NoticesModule,
  ],
  providers: [
    TreatmentService,
    TreatmentsService,
    InformedConsentService,
    PostTransferMilestoneService,
    MedicalCoverageService,
    DoctorNoteService,
    MedicationProtocolService,
    MedicationPdfService,
  ],
  controllers: [TreatmentsController],
  exports: [
    TreatmentService,
    TreatmentsService,
    InformedConsentService,
    PostTransferMilestoneService,
    MedicalCoverageService,
  ],
})
export class TreatmentsModule {}
