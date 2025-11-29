import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { Group2MedicalTermsService } from './group2-medical-terms.service';
import { Group2MedicalTermsController } from './group2-medical-terms.controller';

@Module({
  imports: [HttpModule],
  controllers: [Group2MedicalTermsController],
  providers: [Group2MedicalTermsService],
})
export class Group2MedicalTermsModule {}
