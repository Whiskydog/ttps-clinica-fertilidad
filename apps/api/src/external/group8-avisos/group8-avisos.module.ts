import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AvisosApiService } from './group8-avisos.service';
import { AvisosApiController } from './group8-avisos.controller';

@Module({
  imports: [HttpModule],
  providers: [AvisosApiService],
  controllers: [AvisosApiController],
  exports: [AvisosApiService],
})
export class AvisosApiModule {}
