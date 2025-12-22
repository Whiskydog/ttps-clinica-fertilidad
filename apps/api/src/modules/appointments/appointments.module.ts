import { UsersModule } from '@modules/users/users.module';
import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppointmentsController } from './appointments.controller';
import { MedicalHistoryModule } from '@modules/medical-history/medical-history.module';
import { Appointment } from './appointment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsService } from './appointments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment]),
    HttpModule,
    ConfigModule,
    MedicalHistoryModule,
    forwardRef(() => UsersModule),
  ],
  providers: [AppointmentsService],
  controllers: [AppointmentsController],
  exports: [AppointmentsService],
})
export class AppointmentsModule { }
