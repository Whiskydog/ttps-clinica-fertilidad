import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { Group7GameteBankService } from './group7-gamete-bank.service';
import { Group7GameteBankController } from './group7-gamete-bank.controller';

@Module({
  imports: [HttpModule],
  controllers: [Group7GameteBankController],
  providers: [Group7GameteBankService],
  exports: [Group7GameteBankService],
})
export class Group7GameteBankModule {}
    