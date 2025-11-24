import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalOrder } from './entities/medical-order.entity';
import { StudyResult } from './entities/study-result.entity';
import { MedicalOrdersService } from './medical-orders.service';
import { StudyResultService } from './services/study-result.service';
import { MedicalOrdersController } from './medical-orders.controller';
import { UploadsModule } from '@modules/uploads/uploads.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalOrder, StudyResult]),
    UploadsModule,
  ],
  providers: [MedicalOrdersService, StudyResultService],
  controllers: [MedicalOrdersController],
  exports: [MedicalOrdersService, StudyResultService],
})
export class MedicalOrdersModule {}
