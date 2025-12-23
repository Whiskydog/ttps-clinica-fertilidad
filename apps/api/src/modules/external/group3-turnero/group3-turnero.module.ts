import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { Group3TurneroService } from './group3-turnero.service';
import { Group3TurneroController } from './group3-turnero.controller';

@Module({
  imports: [HttpModule],
  controllers: [Group3TurneroController],
  providers: [Group3TurneroService],
  exports: [Group3TurneroService],
})
export class Group3TurneroModule {}
