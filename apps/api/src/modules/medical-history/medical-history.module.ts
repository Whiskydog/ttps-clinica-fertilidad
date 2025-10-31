import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalHistory } from '@modules/medical-history/entities/medical-history.entity';
import { PartnerData } from '@modules/medical-history/entities/partner-data.entity';
import { GynecologicalHistory } from '@modules/medical-history/entities/gynecological-history.entity';
import { MedicalHistoryService } from '@modules/medical-history/services/medical-history.service';
import { MedicalHistoryController } from '@modules/medical-history/medical-history.controller';
import { MedicalHistoryAuditService } from '@modules/medical-history/services/medical-history-audit.service';
import { PartnerDataService } from '@modules/medical-history/services/partner-data.service';
import { GynecologicalHistoryService } from '@modules/medical-history/services/gynecological-history.service';
import { AuditModule } from '@modules/audit/audit.module';
import { UsersModule } from '@modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MedicalHistory,
      PartnerData,
      GynecologicalHistory,
    ]),
    AuditModule,
    UsersModule,
  ],
  providers: [
    MedicalHistoryService,
    MedicalHistoryAuditService,
    PartnerDataService,
    GynecologicalHistoryService,
  ],
  controllers: [MedicalHistoryController],
  exports: [MedicalHistoryService],
})
export class MedicalHistoryModule {}
