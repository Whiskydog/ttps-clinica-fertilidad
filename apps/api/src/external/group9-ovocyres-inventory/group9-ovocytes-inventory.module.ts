import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OvocytesInventoryApiService } from './group9-ovocytes-inventory.service';
import { OvocytesInventoryApiController } from './group9-ovocytes-inventory.controller';

@Module({
  imports: [HttpModule],
  providers: [OvocytesInventoryApiService],
  controllers: [OvocytesInventoryApiController],
  exports: [OvocytesInventoryApiService],
})
export class OvocytesInventoryApiModule {}
