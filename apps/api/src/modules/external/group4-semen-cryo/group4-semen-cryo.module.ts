import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { Group4SemenCryoService } from './group4-semen-cryo.service';
import { Group4SemenCryoController } from './group4-semen-cryo.controller';

@Module({
  imports: [HttpModule],
  controllers: [Group4SemenCryoController],
  providers: [Group4SemenCryoService],
})
export class Group4SemenCryoModule {}
