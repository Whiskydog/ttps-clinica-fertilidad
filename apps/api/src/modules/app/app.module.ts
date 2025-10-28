import { EnvelopeInterceptor } from '@common/interceptors/envelope.interceptor';
import HttpExceptionFilter from '@filters/http-exception.filter';
import { AppointmentsModule } from '@modules/appointments/appointments.module';
import { AuthModule } from '@modules/auth/auth.module';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { ConfigModule } from '@modules/config/config.module';
import { MedicalHistoryModule } from '@modules/medical-history/medical-history.module';
import { MedicalInsurancesModule } from '@modules/medical-insurances/medical-insurances.module';
import { TreatmentsModule } from '@modules/treatments/treatments.module';
import { UsersModule } from '@modules/users/users.module';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    AuthModule,
    MedicalHistoryModule,
    TreatmentsModule,
    AppointmentsModule,
    MedicalInsurancesModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_INTERCEPTOR, useClass: EnvelopeInterceptor },
  ],
})
export class AppModule {}
