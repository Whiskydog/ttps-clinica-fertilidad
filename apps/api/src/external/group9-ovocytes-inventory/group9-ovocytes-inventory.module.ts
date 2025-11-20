import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { Group9OvocytesInventoryService } from './group9-ovocytes-inventory.service';
import { Group9OvocytesInventoryController } from './group9-ovocytes-inventory.controller';

@Module({
  imports: [HttpModule],
  providers: [Group9OvocytesInventoryService],
  controllers: [Group9OvocytesInventoryController],
  exports: [Group9OvocytesInventoryService],
})
export class Group9OvocytesInventoryModule {}
