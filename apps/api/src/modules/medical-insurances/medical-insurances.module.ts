import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalInsurance } from './entities/medical-insurance.entity';
import { MedicalInsurancesService } from '@modules/medical-insurances/medical-insurances.service';
import { MedicalInsurancesController } from '@modules/medical-insurances/medical-insurances.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalInsurance])],
  controllers: [MedicalInsurancesController],
  providers: [MedicalInsurancesService],
  exports: [MedicalInsurancesService],
})
export class MedicalInsurancesModule {}
