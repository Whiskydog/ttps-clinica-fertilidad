import { Group8NoticesModule } from '@modules/external/group8-notices/group8-notices.module';
import { PunctureRecord } from '@modules/laboratory/entities/puncture-record.entity';
import { MedicalHistory } from '@modules/medical-history/entities/medical-history.entity';
import { MedicalHistoryModule } from '@modules/medical-history/medical-history.module';
import { MedicalOrder } from '@modules/medical-orders/entities/medical-order.entity';
import { PaymentsModule } from '@modules/payments/payments.module';
import { DoctorNote } from '@modules/treatments/entities/doctor-note.entity';
import { InformedConsent } from '@modules/treatments/entities/informed-consent.entity';
import { MedicalCoverage } from '@modules/treatments/entities/medical-coverage.entity';
import { MedicationProtocol } from '@modules/treatments/entities/medication-protocol.entity';
import { Monitoring } from '@modules/treatments/entities/monitoring.entity';
import { PostTransferMilestone } from '@modules/treatments/entities/post-transfer-milestone.entity';
import { Treatment } from '@modules/treatments/entities/treatment.entity';
import { DoctorNoteService } from '@modules/treatments/services/doctor-note.service';
import { InformedConsentService } from '@modules/treatments/services/informed-consent.service';
import { MedicalCoverageService } from '@modules/treatments/services/medical-coverage.service';
import { MedicationPdfService } from '@modules/treatments/services/medication-pdf.service';
import { MedicationProtocolService } from '@modules/treatments/services/medication-protocol.service';
import { PostTransferMilestoneService } from '@modules/treatments/services/post-transfer-milestone.service';
import { TreatmentService } from '@modules/treatments/treatment.service';
import { TreatmentsController } from '@modules/treatments/treatments.controller';
import { TreatmentsService } from '@modules/treatments/treatments.service';
import { UploadsModule } from '@modules/uploads/uploads.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

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
    PaymentsModule,
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
