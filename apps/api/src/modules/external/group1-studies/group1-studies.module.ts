import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { Group1StudiesService } from './group1-studies.service';
import { Group1StudiesController } from './group1-studies.controller';

@Module({
  imports: [HttpModule],
  controllers: [Group1StudiesController],
  providers: [Group1StudiesService],
  exports: [Group1StudiesService],
})
export class Group1StudiesModule {}
