import { Logger, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalOrder } from './entities/medical-order.entity';
import { StudyResult } from './entities/study-result.entity';
import { MedicalOrdersService } from './medical-orders.service';
import { StudyResultService } from './services/study-result.service';
import { MedicalOrdersController } from './medical-orders.controller';
import { UploadsModule } from '@modules/uploads/uploads.module';
import { TreatmentsModule } from '@modules/treatments/treatments.module';
import { Group1StudiesModule } from '@external/group1-studies/group1-studies.module';
import { Group8NoticesModule } from '@external/group8-notices/group8-notices.module';
import { AuditModule } from '@modules/audit/audit.module';
import { User } from '@users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalOrder, StudyResult, User]),
    UploadsModule,
    forwardRef(() => TreatmentsModule),
    Group1StudiesModule,
    Group8NoticesModule,
    AuditModule,
  ],
  providers: [MedicalOrdersService, StudyResultService],
  controllers: [MedicalOrdersController],
  exports: [MedicalOrdersService, StudyResultService],
})
export class MedicalOrdersModule {}
