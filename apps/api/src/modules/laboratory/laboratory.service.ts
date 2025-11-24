import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PunctureRecord } from './entities/puncture-record.entity';
import { Oocyte } from './entities/oocyte.entity';
import { OocyteStateHistory } from './entities/oocyte-state-history.entity';
import { Embryo } from './entities/embryo.entity';

@Injectable()
export class LaboratoryService {
  constructor(
    @InjectRepository(PunctureRecord)
    private punctureRecordRepository: Repository<PunctureRecord>,
    @InjectRepository(Oocyte)
    private oocyteRepository: Repository<Oocyte>,
    @InjectRepository(OocyteStateHistory)
    private oocyteStateHistoryRepository: Repository<OocyteStateHistory>,
    @InjectRepository(Embryo)
    private embryoRepository: Repository<Embryo>,
  ) {}

  // aca CRUD 
}
