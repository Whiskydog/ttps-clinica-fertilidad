import HttpExceptionFilter from '@common/filters/http-exception.filter';
import { EnvelopeInterceptor } from '@common/interceptors/envelope.interceptor';
import { AppointmentsModule } from '@modules/appointments/appointments.module';
import { AuthModule } from '@modules/auth/auth.module';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { ConfigModule } from '@modules/config/config.module';
import { DoctorModule } from '@modules/doctor/doctor.module';
import { ExternalModule } from '@modules/external/external.module';
import { LaboratoryModule } from '@modules/laboratory/laboratory.module';
import { MedicalHistoryModule } from '@modules/medical-history/medical-history.module';
import { MedicalInsurancesModule } from '@modules/medical-insurances/medical-insurances.module';
import { MedicalOrdersModule } from '@modules/medical-orders/medical-orders.module';
import { PaymentsModule } from '@modules/payments/payments.module';
import { SchedulerModule } from '@modules/scheduler/scheduler.module';
import { TreatmentsModule } from '@modules/treatments/treatments.module';
import { UploadsModule } from '@modules/uploads/uploads.module';
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
    MedicalOrdersModule,
    LaboratoryModule,
    AppointmentsModule,
    MedicalInsurancesModule,
    UploadsModule,
    DoctorModule,
    SchedulerModule,
    ExternalModule,
    PaymentsModule,
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
