import { forwardRef, Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalHistory } from '@modules/medical-history/entities/medical-history.entity';
import { PartnerData } from '@modules/medical-history/entities/partner-data.entity';
import { GynecologicalHistory } from '@modules/medical-history/entities/gynecological-history.entity';
import { Habits } from '@modules/medical-history/entities/habits.entity';
import { Fenotype } from '@modules/medical-history/entities/fenotype.entity';
import { Background } from '@modules/medical-history/entities/background.entity';
import { MedicalHistoryService } from '@modules/medical-history/services/medical-history.service';
import { MedicalHistoryController } from '@modules/medical-history/medical-history.controller';
import { MedicalHistoryAuditService } from '@modules/medical-history/services/medical-history-audit.service';
import { PartnerDataService } from '@modules/medical-history/services/partner-data.service';
import { GynecologicalHistoryService } from '@modules/medical-history/services/gynecological-history.service';
import { HabitsService } from '@modules/medical-history/services/habits.service';
import { FenotypeService } from '@modules/medical-history/services/fenotype.service';
import { BackgroundService } from '@modules/medical-history/services/background.service';
import { AuditModule } from '@modules/audit/audit.module';
import { UsersModule } from '@modules/users/users.module';
import { HttpModule } from '@nestjs/axios';
import { MedicalTermsService } from './services/medical-terms.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MedicalHistory,
      PartnerData,
      GynecologicalHistory,
      Habits,
      Fenotype,
      Background,
    ]),
    AuditModule,
    forwardRef(() => UsersModule),
    HttpModule,
  ],
  providers: [
    MedicalHistoryService,
    MedicalHistoryAuditService,
    PartnerDataService,
    GynecologicalHistoryService,
    HabitsService,
    FenotypeService,
    BackgroundService,
    MedicalTermsService,
    Logger,
  ],
  controllers: [MedicalHistoryController],
  exports: [
    MedicalHistoryService,
    HabitsService,
    FenotypeService,
    BackgroundService,
  ],
})
export class MedicalHistoryModule { }
