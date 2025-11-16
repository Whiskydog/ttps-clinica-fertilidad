import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LaboratoryService } from './laboratory.service';
import { PunctureRecordService } from './services/puncture-record.service';
import { OocyteService } from './services/oocyte.service';
import { OocyteStateHistoryService } from './services/oocyte-state-history.service';
import { EmbryoService } from './services/embryo.service';
import { LaboratoryController } from './laboratory.controller';
import { PunctureRecord } from './entities/puncture-record.entity';
import { Oocyte } from './entities/oocyte.entity';
import { OocyteStateHistory } from './entities/oocyte-state-history.entity';
import { Embryo } from './entities/embryo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PunctureRecord,
      Oocyte,
      OocyteStateHistory,
      Embryo,
    ]),
  ],
  controllers: [LaboratoryController],
  providers: [
    LaboratoryService,
    PunctureRecordService,
    OocyteService,
    OocyteStateHistoryService,
    EmbryoService,
  ],
  exports: [
    LaboratoryService,
    PunctureRecordService,
    OocyteService,
    OocyteStateHistoryService,
    EmbryoService,
  ],
})
export class LaboratoryModule {}
