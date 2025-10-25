import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalHistory } from '@modules/medical-history/entities/medical-history.entity';
import { MedicalHistoryService } from '@modules/medical-history/medical-history.service';
import { MedicalHistoryController } from '@modules/medical-history/medical-history.controller';
import { AuditModule } from '@modules/audit/audit.module';
import { UsersModule } from '@modules/users/users.module';

@Module({
  imports: [
  TypeOrmModule.forFeature([MedicalHistory]),
  AuditModule,
  UsersModule,
  ],
  providers: [MedicalHistoryService],
  controllers: [MedicalHistoryController],
  exports: [MedicalHistoryService],
})
export class MedicalHistoryModule {}
