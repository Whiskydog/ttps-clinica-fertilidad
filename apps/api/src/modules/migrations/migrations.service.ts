import { MedicalInsurancesService } from '@modules/medical-insurances/medical-insurances.service';
import { PaymentsService } from '@modules/payments/payments.service';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';

@Injectable()
export class MigrationsService implements OnApplicationBootstrap {
  private readonly logger: Logger = new Logger(MigrationsService.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly medicalInsurancesService: MedicalInsurancesService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Starting migrations...');

    await this.syncMedicalInsurances();

    this.logger.log('Migrations completed.');
  }

  private async syncMedicalInsurances() {
    const externalMedicalInsurances =
      await this.paymentsService.getExternalMedicalInsurances();

    await this.medicalInsurancesService.upsertMedicalInsurances(
      externalMedicalInsurances,
    );
  }
}
