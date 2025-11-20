import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { Treatment } from '../treatments/entities/treatment.entity';
import { Monitoring } from '../treatments/entities/monitoring.entity';
import { PostTransferMilestone } from '../treatments/entities/post-transfer-milestone.entity';
import { InformedConsent } from '../treatments/entities/informed-consent.entity';
import { MedicalOrder } from '../medical-orders/entities/medical-order.entity';
import { PunctureRecord } from '../laboratory/entities/puncture-record.entity';
import { Embryo } from '../laboratory/entities/embryo.entity';
import { Oocyte } from '../laboratory/entities/oocyte.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Treatment,
      Monitoring,
      PostTransferMilestone,
      InformedConsent,
      MedicalOrder,
      PunctureRecord,
      Embryo,
      Oocyte,
    ]),
  ],
  controllers: [DoctorController],
  providers: [DoctorService],
  exports: [DoctorService],
})
export class DoctorModule {}
