import { ZodValidationPipe, ZodSerializerInterceptor } from 'nestjs-zod';
import { APP_PIPE, APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';

import HttpExceptionFilter from '@filters/http-exception.filter';
import { ConfigModule } from '@modules/config/config.module';
import { UsersModule } from '@modules/users/users.module';
import { AuthModule } from '@modules/auth/auth.module';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { MedicalHistoryModule } from '@modules/medical-history/medical-history.module';
import { TreatmentsModule } from '@modules/treatments/treatments.module';
import { AppointmentsModule } from '@modules/appointments/appointments.module';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    AuthModule,
    MedicalHistoryModule,
    TreatmentsModule,
    AppointmentsModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
