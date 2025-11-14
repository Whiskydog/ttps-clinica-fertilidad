import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalOrder } from './entities/medical-order.entity';
import { MedicalOrdersService } from './medical-orders.service';
import { MedicalOrdersController } from './medical-orders.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalOrder])],
  providers: [MedicalOrdersService],
  controllers: [MedicalOrdersController],
  exports: [MedicalOrdersService],
})
export class MedicalOrdersModule {}
