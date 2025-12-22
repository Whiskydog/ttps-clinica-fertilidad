import { MedicalInsurancesModule } from '@modules/medical-insurances/medical-insurances.module';
import { PaymentsModule } from '@modules/payments/payments.module';
import { Module } from '@nestjs/common';
import { MigrationsService } from './migrations.service';

@Module({
  imports: [PaymentsModule, MedicalInsurancesModule],
  providers: [MigrationsService],
})
export class MigrationsModule {}
