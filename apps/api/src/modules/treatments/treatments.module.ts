import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Treatment } from '@modules/treatments/entities/treatment.entity';
import { TreatmentService } from '@modules/treatments/treatment.service';
import { TreatmentsController } from '@modules/treatments/treatments.controller';
import { MedicalHistoryModule } from '../medical-history/medical-history.module';

@Module({
  imports: [TypeOrmModule.forFeature([Treatment]), MedicalHistoryModule],
  providers: [TreatmentService],
  controllers: [TreatmentsController],
  exports: [TreatmentService],
})
export class TreatmentsModule {}
