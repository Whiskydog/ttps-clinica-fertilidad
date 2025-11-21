import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TreatmentSchedulerService } from './treatment-scheduler.service';
import { TreatmentsModule } from '../treatments/treatments.module';
import { Group10TelegramBotModule } from '@external/group10-telegram-bot/group10-telegram-bot.module';
import { Group8NoticesModule } from '@external/group8-notices/group8-notices.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TreatmentsModule,
    Group10TelegramBotModule,
    Group8NoticesModule,
  ],
  providers: [TreatmentSchedulerService],
})
export class SchedulerModule {}
