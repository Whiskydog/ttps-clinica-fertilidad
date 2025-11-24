import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { Group5PaymentsService } from './group5-payments.service';
import { Group5PaymentsController } from './group5-payments.controller';

@Module({
  imports: [HttpModule],
  providers: [Group5PaymentsService],
  controllers: [Group5PaymentsController],
  exports: [Group5PaymentsService],
})
export class Group5PaymentsModule {}
