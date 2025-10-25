import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { MedicalHistoryModule } from '@modules/medical-history/medical-history.module';

@Module({
  imports: [HttpModule, ConfigModule, MedicalHistoryModule],
  providers: [AppointmentsService],
  controllers: [AppointmentsController],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
