import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { Group8NoticesService } from './group8-notices.service';
import { Group8NoticesController } from './group8-notices.controller';

@Module({
  imports: [HttpModule],
  providers: [Group8NoticesService],
  controllers: [Group8NoticesController],
  exports: [Group8NoticesService],
})
export class Group8NoticesModule {}
