import { ZodValidationPipe, ZodSerializerInterceptor } from 'nestjs-zod';
import { APP_PIPE, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { Module } from '@nestjs/common';

import HttpExceptionFilter from '@filters/http-exception.filter';
import { ConfigModule } from '@modules/config/config.module';
import { UsersModule } from '@modules/users/users.module';
import { AppointmentsModule } from '@modules/appointments/appointments.module';
import { MedicalHistoryModule } from '@modules/medical-history/medical-history.module';
import { TreatmentsModule } from '@modules/treatments/treatments.module';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    AppointmentsModule,
    MedicalHistoryModule,
    TreatmentsModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
