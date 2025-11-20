import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TreatmentSchedulerService } from './treatment-scheduler.service';
import { TreatmentsModule } from '../treatments/treatments.module';

@Module({
  imports: [ScheduleModule.forRoot(), TreatmentsModule],
  providers: [TreatmentSchedulerService],
})
export class SchedulerModule {}
